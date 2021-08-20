import FastClick from 'fastclick'
import { PLATFORM } from '@pitcher/core'

export const hasNotWKWebView = PLATFORM === 'IOS' && !window.webkit?.messageHandlers

if (hasNotWKWebView) {
  FastClick.attach(document.body)
}
