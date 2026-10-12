import '@angular/compiler';
import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { LocalMemoryDb } from '../../../../common/app.db';
import { LocalIntegrationRepository } from './integration.repository';
import { LocalUsersRepository } from '../accounts/users.repository';
import { LocalUsersMapper } from '../../mappers/accounts/user.mapper';
import { USERS_TABLE_NAME, type UserRecord } from '../../entity/accounts/user.entity';

describe('Local API access', () => {
  it('persists one access revision and rejects a foreign client without changing the draft owner', () => {
    let state: any = {[USERS_TABLE_NAME]: {ids:['owner','other'], byId:{
      owner:{id:'owner',languages:[],images:[]}, other:{id:'other',languages:[],images:[]}
    }}};
    const db={read:()=>state,write:(change:any)=>{state=change(state);}};
    const injector=createEnvironmentInjector([{provide:LocalMemoryDb,useValue:db}],null as any);
    const repo=runInInjectionContext(injector,()=>new LocalIntegrationRepository());
    const api=repo.createToken('owner','API',30),mcp=repo.createMcpClient('owner',{name:'MCP'});
    const foreign=repo.createToken('other','Other',30);
    expect(repo.mcpSettings('owner','/mcp/private').accessMode).toBe('blocked');
    const request={accessRevision:0,mcpAccess:'full' as const,clients:[{id:api.token.id,accessMode:'blocked' as const},{id:mcp.client.token.id,accessMode:'full' as const}]};
    expect(()=>repo.saveAccess('owner',{...request,clients:[...request.clients,{id:foreign.token.id,accessMode:'full'}]})).toThrow();
    expect(state[USERS_TABLE_NAME].byId.owner.integrationAccess).toBeUndefined();
    repo.saveAccess('owner',request);
    expect(repo.settings('owner','/api/integrations/v1').tokens[0].accessMode).toBe('blocked');
    expect(repo.mcpSettings('owner','/mcp/private').accessMode).toBe('full');
    expect(state[USERS_TABLE_NAME].byId.owner.integrationAccess.revision).toBe(1);
    expect(()=>repo.saveAccess('owner',request)).toThrow('integration.access.conflict');
    expect(state[USERS_TABLE_NAME].byId.other.integrationAccess).toBeUndefined();
    injector.destroy();
  });

  it('keeps one-time credentials out of settings and profile DTOs and enforces independent token scopes', () => {
    let state: any = {[USERS_TABLE_NAME]: {ids:['owner'], byId:{owner:{id:'owner',name:'Owner',images:[],activities:{}}}}};
    const db={read:()=>state,write:(change:any)=>{state=change(state);}};
    const injector=createEnvironmentInjector([{provide:LocalMemoryDb,useValue:db}],null as any);
    const repo=runInInjectionContext(injector,()=>new LocalIntegrationRepository());
    const key=repo.createToken('owner','API',30);
    repo.createToken('owner','API 2',30);repo.createToken('owner','API 3',30);
    expect(()=>repo.createToken('owner','Over limit',30)).toThrow('integration.token.limit.reached');
    const mcp=repo.createMcpClient('owner',{name:'MCP'});
    expect(repo.settings('owner','/api/integrations/v1').tokens).toHaveLength(3);
    expect(repo.mcpSettings('owner','/mcp/private').clients).toHaveLength(1);
    expect(JSON.stringify(repo.settings('owner','/api'))).not.toContain(key.value);
    const dto=LocalUsersMapper.toDto(state[USERS_TABLE_NAME].byId.owner);
    expect(dto).not.toHaveProperty('integrationTokens');expect(dto).not.toHaveProperty('integrationAccess');
    const users=runInInjectionContext(injector,()=>new LocalUsersRepository());
    users.upsertUser(LocalUsersMapper.toRecord({...dto,name:'Renamed'}));
    expect(state[USERS_TABLE_NAME].byId.owner.integrationTokens).toHaveLength(4);
    expect(state[USERS_TABLE_NAME].byId.owner.name).toBe('Renamed');
    expect(()=>repo.createToken('owner','Admin',30,true)).toThrow('admin.api.denied');
    repo.revokeToken('owner',mcp.client.token.id);expect(repo.mcpSettings('owner','/mcp/private').clients).toHaveLength(1);
    repo.revokeMcpClient('owner',mcp.client.token.id);repo.revokeToken('owner',key.token.id);
    expect(repo.mcpSettings('owner','/mcp/private').clients).toHaveLength(0);expect(repo.settings('owner','/api').tokens).toHaveLength(2);
    expect(()=>repo.createMcpClient('owner',{name:'Unsafe',redirectUri:'http://external.test/callback'})).toThrow('mcp.failed');
    injector.destroy();
  });

});
