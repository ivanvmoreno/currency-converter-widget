import { LitElement, html } from 'lit-element';

class CurrencyConverter extends LitElement {
    static get is() {
        return 'currency-converter';
    }
}

customElements.define(CurrencyConverter.is, CurrencyConverter);