import PropTypes from 'prop-types'
import React from 'react'
import AbortController from 'abort-controller'

const abortController = new AbortController()

export const PROVIDER = 'edge'
export const API_VERSION = '1'
export const ACCEPT_LANGUAGE = 'en-US;q=0.7,en;q=0.3'
export const HTTP_ACCEPT = 'en-US;q=0.7,en;q=0.3'

export function requestAbort () {
  abortController.abort()
}

const edgeUrl = (true)
  ? 'https://simplex-sandbox-api.edgesecure.co'
  : 'https://simplex-api.edgesecure.co'

const simplexUrl = (true)
  ? 'https://sandbox.test-simplexcc.com/payments/new'
  : 'https://checkout.simplexcc.com/payments/new'

export function requestConfirm (userId, sessionId, uaid, quote) {
  const body = {
    'account_details': {
      'app_provider_id': PROVIDER,
      'app_version_id': API_VERSION,
      'app_end_user_id': userId,
      'signup_login': {
        'uaid': uaid,
        'accept_language': ACCEPT_LANGUAGE,
        'http_accept_language': HTTP_ACCEPT,
        'user_agent': window.navigator.userAgent,
        'cookie_session_id': sessionId,
        'timestamp': new Date().toISOString()
      }
    },
    'transaction_details': {
      'payment_details': {
        'quote_id': quote.quote_id,
        'payment_id': quote.payment_id,
        'order_id': quote.order_id,
        'fiat_total_amount': {
          'currency': quote.fiat_total_amount_currency,
          'amount': quote.fiat_total_amount_amount
        },
        'requested_digital_amount': {
          'currency': quote.digital_currency,
          'amount': quote.digital_amount
        },
        'destination_wallet': {
          'currency': quote.digital_currency,
          'address': quote.address
        },
        'original_http_ref_url': 'https://www.edgesecure.co/'
      }
    }
  }
  const data = {
    /* signal: abortController.signal, */
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }
  return window.fetch(edgeUrl + '/partner/data', data)
}

export function requestQuote (userId, requested, amount, digitalCurrency, fiatCurrency) {
  // Abort any active requests
  requestAbort()
  const data = {
    /* signal: abortController.signal, */
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      digital_currency: digitalCurrency,
      fiat_currency: fiatCurrency,
      requested_currency: requested,
      requested_amount: parseFloat(amount),
      client_id: userId
    })
  }
  // Issue a new request
  return window.fetch(edgeUrl + '/quote', data)
}

export const SimplexForm = (props) => {
  return (
    <form id='payment_form' action={simplexUrl} method='POST' target='_self'>
      <input type='hidden' name='version' value={props.quote.version} />
      <input type='hidden' name='partner' value={props.quote.partner} />
      <input type='hidden' name='payment_flow_type' value={props.quote.payment_flow_type} />
      <input type='hidden' name='return_url' value={props.quote.return_url} />
      <input type='hidden' name='quote_id' value={props.quote.quote_id} />
      <input type='hidden' name='payment_id' value={props.quote.payment_id} />
      <input type='hidden' name='user_id' value={props.quote.user_id} />
      <input type='hidden' name='destination_wallet[address]' value={props.quote.address} />
      <input type='hidden' name='destination_wallet[currency]' value={props.quote.currency} />
      <input type='hidden' name='fiat_total_amount[amount]' value={props.quote.fiat_total_amount_amount} />
      <input type='hidden' name='fiat_total_amount[currency]' value={props.quote.fiat_total_amount_currency} />
      <input type='hidden' name='digital_total_amount[amount]' value={props.quote.digital_amount} />
      <input type='hidden' name='digital_total_amount[currency]' value={props.quote.digital_currency} />
    </form>
  )
}

SimplexForm.propTypes = {
  quote: PropTypes.object.isRequired
}
