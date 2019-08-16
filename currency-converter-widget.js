import { LitElement, html, css } from 'lit-element';

const ELEMENTS = {
    FORM: 'form',
    AMOUNT_INPUT: 'amount',
    FROM_INPUT: 'from',
    TO_INPUT: 'to',
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
            result: Number
        };
    }

    async connectedCallback() {
        super.connectedCallback();
        const { rates, base } = await fetch('https://api.exchangeratesapi.io/latest').then(res => res.json());
        this.rates = {
            [base]: 1,
            ...rates,
        };
        this.currencies = [base, ...Object.keys(rates)];
    }

    onFormSubmit(event) {
        event.preventDefault();
        const amount = parseFloat(this.shadowRoot.getElementById(ELEMENTS.AMOUNT_INPUT).value);
        const from = this.shadowRoot.getElementById(ELEMENTS.FROM_INPUT).value;
        const to = this.shadowRoot.getElementById(ELEMENTS.TO_INPUT).value;
        this.result = this.convertCurrency(amount, from, to);
    }

    convertCurrency(amount, from, to) {
        const { [from]: fromRate, [to]: toRate} = this.rates;
        return ((amount / fromRate) * toRate).toFixed(5);
    }

    swapCurrencies() {
        const fromInput = this.shadowRoot.getElementById(ELEMENTS.FROM_INPUT);
        const toInput = this.shadowRoot.getElementById(ELEMENTS.TO_INPUT);
        [fromInput.value, toInput.value] = [toInput.value, fromInput.value];
    }

    renderForm() {
        const currenciesOptions = this.currencies.map(curr => html`<option value=${curr}>${curr}</option>`);
        return html`
            <form id="form" class="form" @submit=${this.onFormSubmit}>
                <div class="input">
                    <label class="input__label">Amount</label>
                    <input id=${ELEMENTS.AMOUNT_INPUT} class="input__field" type="number" min=".01" step=".01" value="1">
                </div>
                <div class="input">
                    <label class="input__label">From</label>
                    <select id=${ELEMENTS.FROM_INPUT} class="input__field input__field--select">
                        ${currenciesOptions}
                    </select>
                </div>
                <div class="input">
                    <label class="input__label">To</label>
                    <select id=${ELEMENTS.TO_INPUT} class="input__field input__field--select">
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
        const amount = this.shadowRoot.getElementById(ELEMENTS.AMOUNT_INPUT).value;
        const from = this.shadowRoot.getElementById(ELEMENTS.FROM_INPUT).value;
        const to = this.shadowRoot.getElementById(ELEMENTS.TO_INPUT).value;
        return html`
            <div class="result">
                <div class="result__from">${amount} ${from} =</div>
                <div class="result__to">${this.result} <span>${to}</span></div>
                <div class="rates">
                    <div class="rates__rate">1 ${to} = ${this.convertCurrency(1, to, from)} ${from}</div>
                    <div class="rates__rate">1 ${from} = ${this.convertCurrency(1, from, to)} ${to}</div>
                </div>
            </div>
        `;
    }

    render() {
        return html`
            <div class="container">
                ${ this.renderForm() }
                ${ this.result &&
                    this.renderResult() }
            </div>
        `;
    }
}

customElements.define(CurrencyConverter.is, CurrencyConverter);