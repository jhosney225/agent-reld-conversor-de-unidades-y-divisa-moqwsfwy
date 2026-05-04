
```javascript
const Anthropic = require("@anthropic-ai/sdk");
const readline = require("readline");

const client = new Anthropic();

// Tool definitions for unit and currency conversion
const tools = [
  {
    name: "convert_length",
    description:
      "Convert between length units (meters, kilometers, miles, feet, inches, centimeters)",
    input_schema: {
      type: "object",
      properties: {
        value: {
          type: "number",
          description: "The value to convert",
        },
        from_unit: {
          type: "string",
          description:
            "The unit to convert from (m, km, mi, ft, in, cm, mm, yd)",
        },
        to_unit: {
          type: "string",
          description: "The unit to convert to (m, km, mi, ft, in, cm, mm, yd)",
        },
      },
      required: ["value", "from_unit", "to_unit"],
    },
  },
  {
    name: "convert_weight",
    description:
      "Convert between weight units (kilograms, grams, pounds, ounces, tons)",
    input_schema: {
      type: "object",
      properties: {
        value: {
          type: "number",
          description: "The value to convert",
        },
        from_unit: {
          type: "string",
          description: "The unit to convert from (kg, g, lb, oz, ton, mg)",
        },
        to_unit: {
          type: "string",
          description: "The unit to convert to (kg, g, lb, oz, ton, mg)",
        },
      },
      required: ["value", "from_unit", "to_unit"],
    },
  },
  {
    name: "convert_temperature",
    description: "Convert between temperature units (Celsius, Fahrenheit, Kelvin)",
    input_schema: {
      type: "object",
      properties: {
        value: {
          type: "number",
          description: "The temperature value to convert",
        },
        from_unit: {
          type: "string",
          description: "The unit to convert from (C, F, K)",
        },
        to_unit: {
          type: "string",
          description: "The unit to convert to (C, F, K)",
        },
      },
      required: ["value", "from_unit", "to_unit"],
    },
  },
  {
    name: "convert_currency",
    description:
      "Convert between currencies using current exchange rates (USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, MXN)",
    input_schema: {
      type: "object",
      properties: {
        value: {
          type: "number",
          description: "The amount to convert",
        },
        from_currency: {
          type: "string",
          description:
            "The currency to convert from (USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, MXN)",
        },
        to_currency: {
          type: "string",
          description:
            "The currency to convert to (USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, MXN)",
        },
      },
      required: ["value", "from_currency", "to_currency"],
    },
  },
];

// Conversion factors (base unit: SI)
const lengthFactors = {
  m: 1,
  km: 1000,
  mi: 1609.344,
  ft: 0.3048,
  in: 0.0254,
  cm: 0.01,
  mm: 0.001,
  yd: 0.9144,
};

const weightFactors = {
  kg: 1,
  g: 0.001,
  lb: 0.453592,
  oz: 0.0283495,
  ton: 1000,
  mg: 0.000001,
};

// Mock exchange rates (in production, would use real API)
const exchangeRates = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  CAD: 1.36,
  AUD: 1.53,
  CHF: 0.88,
  CNY: 7.24,
  INR: 83.1,
  MXN: 17.05,
};

function convertLength(value, fromUnit, toUnit) {
  const fromUnitLower = fromUnit.toLowerCase();
  const toUnitLower = toUnit.toLowerCase();

  if (!lengthFactors[fromUnitLower] || !lengthFactors[toUnitLower]) {
    throw new Error(
      `Unknown length unit. Supported units: ${Object.keys(lengthFactors).join(", ")}`
    );
  }

  const valueInMeters = value * lengthFactors[fromUnitLower];
  const result = valueInMeters / lengthFactors[toUnitLower];

  return {
    original_value: value,
    original_unit: fromUnit,
    converted_value: Math.round(result * 10000) / 10000,
    target_unit: toUnit,
    formula: `${value} ${fromUnit} × ${lengthFactors[fromUnitLower]} m/${fromUnit} ÷ ${lengthFactors[toUnitLower]} m/${toUnit}`,
  };
}

function convertWeight(value, fromUnit, toUnit) {
  const fromUnitLower = fromUnit.toLowerCase();
  const toUnitLower = toUnit.toLowerCase();

  if (!weightFactors[fromUnitLower] || !weightFactors[toUnitLower]) {
    throw new Error(
      `Unknown weight unit. Supported units: ${Object.keys(weightFactors).join(