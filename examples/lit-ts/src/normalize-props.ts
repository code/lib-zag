import { createNormalizer } from "@zag-js/types"
import { isObject, isString } from "@zag-js/utils"

const eventMap: any = {
  onFocus: "onFocusIn",
  onBlur: "onFocusOut",
  onDoubleClick: "onDblClick",
  onChange: "onInput",
  defaultChecked: "checked",
  defaultValue: "value",
  htmlFor: "for",
  className: "class",
}

function toProp(prop: string) {
  return prop in eventMap ? eventMap[prop] : prop
}

type Dict = Record<string, any>

const falsySkipList = ["hidden", "readOnly"]

export const normalizeProps = createNormalizer<any>((props: Dict) => {
  const normalized: Dict = {}

  for (const key in props) {
    let value = props[key]

    if (key === "style" && isObject(value)) {
      normalized["style"] = cssify(value)
      continue
    }

    if (falsySkipList.includes(key)) {
      value = value === false ? undefined : ""
    }

    if (key === "children") {
      if (isString(value)) {
        normalized["textContent"] = value
      }
      continue
    }

    if (key === "disabled") {
      normalized["disabled"] = value ? "" : undefined
      continue
    }

    let nextKey = toProp(key)
    if (nextKey.startsWith("on")) {
      nextKey = "@" + nextKey.slice(2).toLowerCase()
    }

    normalized[nextKey] = value
  }
  return normalized
})

function cssify(style: Record<string, number | string>) {
  let string = ""

  for (let key in style) {
    const value = style[key]
    if (value === null || value === undefined) continue
    if (!key.startsWith("--")) key = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
    string += `${key}:${value};`
  }
  return string
}
