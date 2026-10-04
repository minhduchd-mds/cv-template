(() => {
  'use strict'

  const UNSAFE_TAGS = 'script,iframe,object,embed,link,meta,base,style'
  const URL_ATTRS = new Set(['href', 'src', 'action', 'formaction', 'xlink:href'])

  // Markup is parsed inert, stripped of script sinks, then inserted; never assign innerHTML directly.
  const parseSafeHTML = (markup) => {
    const doc = new DOMParser().parseFromString(`<template>${markup}</template>`, 'text/html')
    const fragment = doc.querySelector('template').content
    fragment.querySelectorAll(UNSAFE_TAGS).forEach((node) => node.remove())
    fragment.querySelectorAll('*').forEach((node) => {
      for (const { name, value } of [...node.attributes]) {
        const attr = name.toLowerCase()
        const scriptUrl = URL_ATTRS.has(attr) && /^javascript:/i.test(value.replace(/[\u0000-\u0020]/g, ''))
        if (attr.startsWith('on') || attr === 'srcdoc' || scriptUrl) node.removeAttribute(name)
      }
    })
    return document.importNode(fragment, true)
  }

  window.CVSafeDom = (element) => ({
    set html(markup) { element.replaceChildren(parseSafeHTML(String(markup))) },
  })
})()
