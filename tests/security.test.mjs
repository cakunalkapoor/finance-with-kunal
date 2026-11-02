import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import ts from 'typescript';
import { inlineScriptHashes, contentSecurityPolicy, secureHtml, hardenExport } from '../src/lib/postbuild-security.mjs';

const code=ts.transpileModule(readFileSync(new URL('../src/lib/html.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {escapeHtml}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));

test('provider labels remain text instead of HTML or event handlers',()=>{
  assert.equal(escapeHtml('<img src=x onerror="alert(1)"> & \'company\''),'&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; &#39;company&#39;');
  assert.equal(escapeHtml('AT&T <Class A>'),'AT&amp;T &lt;Class A&gt;');
  assert.equal(escapeHtml(0),'0');
  assert.equal(escapeHtml(null),'');
});

test('the policy allows exact exported inline scripts, not arbitrary inline or eval code',()=>{
  const body='self.__next_f.push([1,"financial data"]);';
  const html=`<html><head><meta charset="utf-8"/><script src="/_next/static/app.js"></script></head><body><script>${body}</script></body></html>`;
  const expected="'sha256-"+createHash('sha256').update(body).digest('base64')+"'";
  assert.deepEqual(inlineScriptHashes(html),[expected]);
  const policy=contentSecurityPolicy(html);
  assert(policy.includes(expected));
  assert(!policy.split(';').find(rule=>rule.trim().startsWith('script-src ')).includes('unsafe-inline'));
  assert(!policy.includes('unsafe-eval'));
  for(const directive of ["base-uri 'none'","object-src 'none'","form-action 'none'","script-src-attr 'none'"])assert(policy.includes(directive));
});

test('security metadata precedes executable content and preserves Unicode, existing scripts and idempotence',()=>{
  const body='console.log("CPI ₹ and café");';
  const original=`<!DOCTYPE html><html><head><meta charSet="utf-8"/><meta name="viewport" content="width=device-width"/><script>${body}</script></head><body>₹</body></html>`;
  const hardened=secureHtml(original);
  assert(hardened.indexOf('charSet')<hardened.indexOf('site-csp'));
  assert(hardened.indexOf('site-csp')<hardened.indexOf('<script>'));
  assert(hardened.includes(`<script>${body}</script>`));
  assert.equal(secureHtml(hardened),hardened);
  assert(hardened.indexOf('charSet')<1024);
  assert.equal(inlineScriptHashes('<script>a\r\nb</script>')[0],inlineScriptHashes('<script>a\nb</script>')[0]);
});

test('a changed script does not inherit another script hash and external script changes fail closed',()=>{
  assert.notDeepEqual(inlineScriptHashes('<script>safe()</script>'),inlineScriptHashes('<script>changed()</script>'));
  for(const src of ['https://untrusted.example/code.js','//untrusted.example/code.js','data:text/javascript,alert(1)','javascript:alert(1)']){
    assert.throws(()=>secureHtml(`<html><head><script src="${src}"></script></head></html>`),/external executable/);
  }
  assert.throws(()=>secureHtml('<html><head><script>a()</script><meta charset="utf-8"/></head></html>'),/active content/);
  assert.throws(()=>secureHtml('<html><body>missing head</body></html>'),/no head/);
});

test('all exported application documents are protected while the ownership challenge remains exact',()=>{
  const folder=mkdtempSync(join(tmpdir(),'kunal-security-export-'));
  try{
    writeFileSync(join(folder,'index.html'),'<html><head></head><body>Public</body></html>');
    const challenge='google-site-verification: googlebcea7e1eb15ca04f.html';
    writeFileSync(join(folder,'googlebcea7e1eb15ca04f.html'),challenge);
    assert.equal(hardenExport(folder),1);
    assert(readFileSync(join(folder,'index.html'),'utf8').includes('site-csp'));
    assert.equal(readFileSync(join(folder,'googlebcea7e1eb15ca04f.html'),'utf8'),challenge);
  }finally{rmSync(folder,{recursive:true,force:true});}
});
