import { test, expect } from 'vitest'
import { Color } from '../index'

test('new Color(hex)', () => {
  expect(new Color('#2ecc71').toRgb()).toBe('rgb(46, 204, 113)')
})

test('new Color(rgb)', () => {
  expect(new Color('rgb(46, 204, 113)').toHex()).toBe('#2ecc71')
  expect(new Color(46, 204, 113).toHex()).toBe('#2ecc71')
})

test('new Color(Invalid Color)', () => {
  expect(new Color('rgb(46, 204, -10)').toHex()).toBe('#000000')
})
