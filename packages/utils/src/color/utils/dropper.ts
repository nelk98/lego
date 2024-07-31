export default async function dropper(): Promise<{
  sRGBHex: string
}> {
  if (!window.EyeDropper) {
    const err = new Error(
      window.isSecureContext
        ? '浏览器不支持拾色器，请更新浏览器后再次尝试，\n推荐使用 Chrome/Edge 95 以上版本。'
        : '非<https>协议不支持使用拾色器。'
    )
    console.error(err)
    return Promise.reject(err)
  }
  const dropper = new window.EyeDropper()
  try {
    const res = await dropper.open()
    return Promise.resolve(res)
  } catch (err) {
    return Promise.reject(err)
  }
}
