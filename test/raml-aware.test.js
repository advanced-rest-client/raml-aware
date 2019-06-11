import { fixture, assert, nextFrame } from '@open-wc/testing';
import '../raml-aware.js';

describe('<raml-aware>', () => {
  async function a1Fixture() {
    return (await fixture(`
      <raml-aware></raml-aware>
    `));
  }

  async function a2Fixture() {
    return (await fixture(`
      <raml-aware scope="test"></raml-aware>
    `));
  }

  async function a3Fixture() {
    return (await fixture(`
      <raml-aware></raml-aware>
    `));
  }

  async function a4Fixture() {
    return (await fixture(`
      <raml-aware scope="test"></raml-aware>
    `));
  }

  describe('basic', () => {
    let a1;
    let a2;
    let a3;
    let a4;

    beforeEach(async () => {
      a1 = await a1Fixture();
      a2 = await a2Fixture();
      a3 = await a3Fixture();
      a4 = await a4Fixture();
    });

    afterEach(() => {
      a1.api = undefined;
      a2.api = undefined;
      a3.api = undefined;
      a4.api = undefined;
      a1.parentNode.removeChild(a1);
      a2.parentNode.removeChild(a2);
      a3.parentNode.removeChild(a3);
      a4.parentNode.removeChild(a4);
    });

    it('Sets default scope', () => {
      assert.equal(a1.scope, 'default');
      assert.equal(a3.scope, 'default');
    });

    it('Respects scope from attribute', () => {
      assert.equal(a2.scope, 'test');
      assert.equal(a4.scope, 'test');
    });

    it('Sets data on default scopes only', () => {
      const obj = { a: 'b' };
      a1.api = obj;
      assert.equal(a3.api.a, 'b');
      assert.isUndefined(a2.api);
      assert.isUndefined(a4.api);
    });

    it('Sets data on defined scopes only', () => {
      const obj = { b: 'c' };
      a2.api = obj;
      assert.isUndefined(a1.api);
      assert.isUndefined(a3.api);
      assert.equal(a4.api.b, 'c');
    });

    it('`raml-aware` sets api for test scope', () => {
      const obj = { a: 'b' };
      a2.api = obj;
      assert.deepEqual(a4.api, obj);
    });

    it('`raml-aware` does not set api on other scopes', () => {
      const obj = { a: 'b' };
      a1.api = obj;
      assert.notDeepEqual(a2.api, obj);
    });

    it('Sets scope attribute from property change', () => {
      a1.scope = 'other-scope';
      assert.equal(a1.getAttribute('scope'), 'other-scope');
    });

    it('Dispatches "raml-changed" event', () => {
      let value;
      a1.addEventListener('raml-changed', function f(e) {
        a1.removeEventListener('raml-changed', f);
        value = e.detail.value;
      });
      const obj = { test: true };
      a1.raml = obj;
      assert.isTrue(value === obj);
    });

    it('Dispatches "raml-changed" event on another scoped element', () => {
      let value;
      a4.addEventListener('raml-changed', function f(e) {
        a4.removeEventListener('raml-changed', f);
        value = e.detail.value;
      });
      const obj = { test: true };
      a2.raml = obj;
      assert.isTrue(value === obj);
    });

    it('Dispatches "api-changed" event', () => {
      let value;
      a1.addEventListener('api-changed', function f(e) {
        a1.removeEventListener('api-changed', f);
        value = e.detail.value;
      });
      const obj = { test: true };
      a1.api = obj;
      assert.isTrue(value === obj);
    });

    it('Dispatches "api-changed" event on another scoped element', () => {
      let value;
      a4.addEventListener('api-changed', function f(e) {
        a4.removeEventListener('api-changed', f);
        value = e.detail.value;
      });
      const obj = { test: true };
      a2.api = obj;
      assert.isTrue(value === obj);
    });

    it('Dispatches "api-changed" event when setting "raml" property', () => {
      let value;
      a1.addEventListener('api-changed', function f(e) {
        a1.removeEventListener('api-changed', f);
        value = e.detail.value;
      });
      const obj = { test: true };
      a1.raml = obj;
      assert.isTrue(value === obj);
    });

    it('Dispatches "api-changed" event on another scoped element when setting "raml" property', () => {
      let value;
      a4.addEventListener('api-changed', function f(e) {
        a4.removeEventListener('api-changed', f);
        value = e.detail.value;
      });
      const obj = { test: true };
      a2.raml = obj;
      assert.isTrue(value === obj);
    });
  });

  describe('Data cleanup', () => {
    let a1;
    let a2;
    let a3;

    function create(api) {
      const a = document.createElement('raml-aware');
      a.api = api;
      document.body.appendChild(a);
      return a;
    }

    it('Sets reference to the data when one is removed', async () => {
      a1 = create('test');
      a2 = create();
      a1.parentNode.removeChild(a1);
      a3 = create();
      await nextFrame();
      assert.equal(a3.api, 'test');
      a3.parentNode.removeChild(a3);
    });

    it('Removing only aware clears data', async () => {
      a2.parentNode.removeChild(a2);
      a3 = create();
      await nextFrame();
      assert.isUndefined(a3.api);
    });
  });
});
