import { LitElement, html, css } from 'lit-element';

const ELEMENTS = {
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

            * {
                background: var(--currency-converter-widget-background, #002272);
                font-family: var(--currency-converter-widget-font-family, Arial);
                color: var(--currency-converter-widget-font-family, #FFF);
            }

            .container {
                display: flex;
                justify-content: center;
                padding: 1.5rem;
            }

            .form {
                display: flex;
            }

            .input {
                display: flex;
                flex-direction: column;
                padding: 0 .5rem;
            }

            .input__label {
                padding-bottom: .5rem;
            }

            .input__field {
                height: 3rem;
                font-size: 2rem;
                padding: 0 .5rem;
                border-radius: var(--currency-converter-input-border-radius, 10px);
            }

            .input__field--submit {
                margin-top: auto;
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

    constructor() {
        super();
        this.amount = 1;
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
        const amount = parseInt(this.shadowRoot.getElementById(ELEMENTS.AMOUNT_INPUT).value);
        const from = this.shadowRoot.getElementById(ELEMENTS.FROM_INPUT).value;
        const to = this.shadowRoot.getElementById(ELEMENTS.TO_INPUT).value;
        this.result = this.convertCurrency(amount, from, to);
    }

    convertCurrency(amount, from, to) {
        const { [from]: fromRate, [to]: toRate} = this.rates;
        return (amount / fromRate) * toRate;
    }

    swapCurrencies() {
        const fromInput = this.shadowRoot.getElementById(ELEMENTS.FROM_INPUT);
        const toInput = this.shadowRoot.getElementById(ELEMENTS.TO_INPUT);
        [fromInput.value, toInput.value] = [toInput.value, fromInput.value];
    }

    reset() {
        this.result = undefined;
    }

    renderForm() {
        const currenciesOptions = this.currencies.map(curr => html`<option value=${curr}>${curr}</option>`);
        return html`
            <form class="form">
                <div class="input">
                    <label class="input__label">Amount</label>
                    <input id=${ELEMENTS.AMOUNT_INPUT} class="input__field" value="1">
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
                <div class="input" @click=${this.swapCurrencies}>
                    <img class="input__img" src="" alt="Swap currencies">
                </div>
                <div class="input">
                    <input class="input__field input__field--submit" type="button" value="Submit" @click=${this.onFormSubmit}>
                </div>
            </form>
        `;
    }

    renderResult() {
        return html`
            <div>${this.result}</div>
            <button @click=${this.reset}>Return</button>
        `;
    }

    render() {
        return html`
            <div class="container">
                ${ this.result
                    ? this.renderResult()
                    : this.renderForm() }
            </div>
        `;
    }
}

customElements.define(CurrencyConverter.is, CurrencyConverter);