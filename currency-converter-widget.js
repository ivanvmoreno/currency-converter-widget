import { LitElement, html, css } from 'lit-element';

const ELEMENTS = {
    FROM_SELECT: 'from',
    TO_SELECT: 'to',
};
class CurrencyConverter extends LitElement {
    static get is() {
        return 'currency-converter';
    }

    static get styles() {
        return css`
            :host {
                display: block;
            }

            :host[hidden] {
                display: none;
            }

            .container {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 1.5rem;
                background: var(--currency-converter-widget-background, linear-gradient(to right,#073590,#0D49C0));
                font-family: var(--currency-converter-widget-font-family, Arial);
                color: var(--currency-converter-widget-color, #FFF);
                border-radius: var(--currency-converter-widget-input-field-border-radius, 5px);
            }

            .form {
                display: flex;
                flex-wrap: wrap;
            }

            .input {
                display: flex;
                flex-direction: column;
                padding: 0 .5rem;
            }

            .input__label {
                padding-bottom: .5rem;
            }

            /* reset input browser styles */
            .input__field {
                border:none;
                background-image: none;
                background-color: transparent;
                -webkit-box-shadow: none;
                -moz-box-shadow: none;
                box-shadow: none;
            }

            .input__field {
                height: 3rem;
                font-size: 2rem;
                padding: 0 .75rem;
                background: var(--currency-converter-widget-input-field-background, #FFF);
                color: var(--currency-converter-widget-input-field-color, #073590);
                border-radius: var(--currency-converter-widget-input-field-border-radius, 5px);
            }
            
            .input__field--swap, .input__field--submit {
                margin-top: auto;
                padding: 0 2rem;
                font-size: 1.5rem;
                font-weight: bold;
                cursor: pointer;
            }

            .input__field--swap {
                background: var(--currency-converter-widget-input-field-swap-background, #fcb813);
            }

            .input__field--submit {
                background: var(--currency-converter-widget-input-field-submit-background, #fcb813);
            }

            .result {
                text-align: center;
                margin-top: .5rem;
            }

            .result__from {
                font-size: 1.5rem;
            }

            .result__to {
                font-size: 3rem;
            }

            .result__to span {
                font-size: 1.5rem;
            }

            .rates {
                font-weight: bold;
            }

            .rates > div:not(:last-child) {
                margin: .5rem 0;
            }
        `;
    }

    static get properties() {
        return {
            rates: Object,
            currencies: Array,
            amount: Number,
            from: String, 
            to: String, 
            result: {
                type: Number,
                attribute: false
            }
        };
    }

    constructor() {
        super();
        this.rates = {};
        this.currencies = [];
        this.amount = 1;
    }

    convertCurrency(amount = this.amount, from = this.from, to = this.to) {
        const { [from]: fromRate, [to]: toRate} = this.rates;
        return ((amount / fromRate) * toRate).toFixed(5);
    }

    swapCurrencies() {
        [this.from, this.to] = [this.to, this.from];
        this.result = this.convertCurrency();
    }

    onAmountChange(event) {
        this.amount = event.target.value;
        this.result = this.convertCurrency();
    }

    onFromChange(event) {
        this.from = event.target.value;
        this.result = this.convertCurrency();
    }

    onToChange(event) {
        this.to = event.target.value;
        this.result = this.convertCurrency();
    }

    onFormSubmit(event) {
        event.preventDefault();
        this.result = this.convertCurrency();
    }

    renderForm() {
        const currenciesOptions = this.currencies.map(curr => html`<option value=${curr}>${curr}</option>`);
        return html`
            <form class="form" @submit=${this.onFormSubmit}>
                <div class="input">
                    <label class="input__label">Amount</label>
                    <input class="input__field" type="number" min=".01" step=".01" placeholder="Amount to convert..." .value=${this.amount} @input=${this.onAmountChange}>
                </div>
                <div class="input">
                    <label class="input__label">From</label>
                    <select id=${ELEMENTS.FROM_SELECT} class="input__field input__field--select" .value=${this.from} @change=${this.onFromChange}>
                        ${currenciesOptions}
                    </select>
                </div>
                <div class="input">
                    <label class="input__label">To</label>
                    <select id=${ELEMENTS.TO_SELECT} class="input__field input__field--select" .value=${this.to} @change=${this.onToChange}>
                        ${currenciesOptions}
                    </select>
                </div>
                <div class="input input--swap" @click=${this.swapCurrencies}>
                    <input class="input__field input__field--submit" type="button" value="Swap">
                </div>
                <div class="input">
                    <input class="input__field input__field--submit" type="submit" value="Convert">
                </div>
            </form>
        `;
    }

    renderResult() {
        return html`
            <div class="result">
                <div class="result__from">${this.amount} ${this.from} =</div>
                <div class="result__to">${this.result} <span>${this.to}</span></div>
                <div class="rates">
                    <div class="rates__rate">1 ${this.to} = ${this.convertCurrency(1, this.to, this.from)} ${this.from}</div>
                    <div class="rates__rate">1 ${this.from} = ${this.convertCurrency(1, this.from, this.to)} ${this.to}</div>
                </div>
            </div>
        `;
    }

    render() {
        return html`
            <div class="container">
                ${ this.renderForm() }
                ${ this.result && this.amount &&
                    this.renderResult() }
            </div>
        `;
    }

    updated(changedProperties) {
        if ([...changedProperties.keys()].includes('currencies')) {
            if (!this.from) {
                this.from = this.currencies[0];
                this.to = this.currencies[1];
            } else {
                this.shadowRoot.getElementById(ELEMENTS.FROM_SELECT).value = this.from;
                this.shadowRoot.getElementById(ELEMENTS.TO_SELECT).value = this.to;
            }
        }
    }
}

customElements.define(CurrencyConverter.is, CurrencyConverter);