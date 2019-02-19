/**
@license
Copyright 2018 The Advanced REST client authors
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import {PolymerElement} from '@polymer/polymer/polymer-element.js';

const RAMLAware = {
  defaultScope: 'default',
  ramlAwares: [],
  /**
   * Store for RAML definitions.
   * @type {Object<String, Object>} The key is a scope (`default` by default)
   * and the value is the RAML definition for this scope.
   */
  raml: {},
  /**
   * Attaches new RAML aware to the system. Added aware element will get
   * updates about new content.
   *
   * @param {RamlAware} aware The aware instance.
   */
  attachRamlAware: function(aware) {
    if (this.ramlAwares.indexOf(aware) === -1) {
      this.ramlAwares.push(aware);
      if (!aware.scope) {
        aware.scope = this.defaultScope;
      } else {
        this.scopeChanged(aware);
      }
    }
  },
  /**
   * Removes avare from the map.
   * @param {RamlAware} aware Instance of the aware
   */
  detachRamlAware: function(aware) {
    const index = this.ramlAwares.indexOf(aware);
    if (index !== -1) {
      this.ramlAwares.splice(index, 1);
      this.cleanUpData(aware.scope);
    } else {
      console.warn('The aware wasn\'t attached!');
    }
  },
  /**
   * [setRaml description]
   * @param {HTMLElement} srcAware The aware that notified about the change
   */
  setRaml: function(srcAware) {
    const scope = srcAware.scope || this.defaultScope;
    const raml = srcAware.raml || undefined;
    this.raml[scope] = raml;
    const defaultScope = this.defaultScope;
    this.ramlAwares.forEach(function(aware) {
      if (aware === srcAware) {
        return;
      }
      const localScope = aware.scope || defaultScope;
      if (localScope !== scope) {
        return;
      }
      aware.raml = raml;
    });
  },

  scopeChanged: function(aware) {
    const scope = aware.scope || this.defaultScope;
    if (this.raml[scope]) {
      aware.raml = this.raml[scope];
    }
  },
  /**
   * Checks if
   * @param {String} scope
   */
  cleanUpData: function(scope) {
    const awares = this.ramlAwares;
    for (let i = 0, len = awares.length; i < len; i++) {
      if (awares[i].scope === scope) {
        return;
      }
    }
    delete this.raml[scope];
  }
};
/**
 *
 * Element that is aware of the AMF (RAML, OAS) content.
 *
 * The element contains the same RAML data as other elements whenever their
 * location in the document. The RAML data are encapsulated in `scope` attribute.
 * By default the `scope` is `default`. If you create two `<raml-aware>`s with
 * different scopes then changing one raml will not affect the other.
 *
 * Setting a RAML data on a `<raml-aware>` will notify other awares with the same
 * scopes about the change and update their RAML data so it can be transfered
 * between different parts of application on even different web components.
 *
 * ### Example
 *
 * ```html
 * <raml-aware raml="{{raml}}" scope="request"></raml-aware>
 * <raml-aware raml="{{importRaml}}" scope="import"></raml-aware>
 * ```
 *
 * ```javascript
 * const r1 = document.querySelector('raml-aware[scope="request"]');
 * const r2 = document.querySelector('raml-aware[scope="import"]');
 * r1.raml = {};
 * r2.raml = null;
 * assert(r1.raml !== r2.raml);
 * ```
 *
 * ## Limitations
 *
 * `RamlAware` has to be attached to DOM for it to work. This element uses
 * web components callback methods to initialize value. If the component is
 * never attached it will never initialize it's values.
 *
 * @customElement
 * @polymer
 * @memberof ApiElements
 * @demo demo/index.html
 */
export class RamlAware extends PolymerElement {
  static get is() {
    return 'raml-aware';
  }
  static get properties() {
    return {
      /**
       * Scope for the RAML file.
       * Different awares may have different scope and keep different RAML objects.
       * It can be useful when one aware supports request panel and another
       * RAML import for example. In this case first one may have scope not set
       * (`default` scope) and second one `import` scope. Then both RAMLs are
       * encapsulated to the scope.
       */
      scope: {
        type: String,
        observer: '_scopeChanged'
      },
      // The RAML/AMF definition.
      raml: {
        type: Object,
        notify: true
      }
    };
  }
  static get observers() {
    return [
      '_ramlChanged(raml.*)'
    ];
  }

  connectedCallback() {
    super.connectedCallback();
    RAMLAware.attachRamlAware(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    RAMLAware.detachRamlAware(this);
  }
  /**
   * Update RAML data for selected scope.
   */
  _scopeChanged() {
    RAMLAware.scopeChanged(this);
  }
  /**
   * Notifies other awares about RAML change.
   */
  _ramlChanged() {
    RAMLAware.setRaml(this);
  }
}
window.customElements.define(RamlAware.is, RamlAware);
