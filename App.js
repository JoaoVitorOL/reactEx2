import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Text,
} from 'react-native';
import { Provider as PaperProvider, Button, Surface } from 'react-native-paper';

// ────────────────────────────────────────────────
//  Tema escuro inspirado em calculadoras clássicas
// ────────────────────────────────────────────────
const theme = {
  colors: {
    background: '#1a1a2e',
    surface: '#16213e',
    display: '#0f3460',
    number: '#e0e0e0',
    operator: '#e94560',
    operatorText: '#ffffff',
    equal: '#e94560',
    equalText: '#ffffff',
    special: '#533483',
    specialText: '#ffffff',
    displayText: '#ffffff',
    subText: '#a0a0b0',
  },
};

// ────────────────────────────────────────────────
//  Configuração dos botões
// ────────────────────────────────────────────────
const BUTTONS = [
  [
    { label: 'AC', type: 'special' },
    { label: '+/-', type: 'special' },
    { label: '%', type: 'special' },
    { label: '÷', type: 'operator', value: '/' },
  ],
  [
    { label: '7', type: 'number' },
    { label: '8', type: 'number' },
    { label: '9', type: 'number' },
    { label: '×', type: 'operator', value: '*' },
  ],
  [
    { label: '4', type: 'number' },
    { label: '5', type: 'number' },
    { label: '6', type: 'number' },
    { label: '−', type: 'operator', value: '-' },
  ],
  [
    { label: '1', type: 'number' },
    { label: '2', type: 'number' },
    { label: '3', type: 'number' },
    { label: '+', type: 'operator', value: '+' },
  ],
  [
    { label: '0', type: 'number', wide: true },
    { label: ',', type: 'number' },
    { label: '=', type: 'equal' },
  ],
];

// ────────────────────────────────────────────────
//  Componente principal
// ────────────────────────────────────────────────
export default function App() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [firstValue, setFirstValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForSecond, setWaitingForSecond] = useState(false);
  const [justCalculated, setJustCalculated] = useState(false);

  // Formata número para exibição
  const formatDisplay = (value) => {
    if (value.toString().length > 10) {
      const num = parseFloat(value);
      if (Number.isInteger(num)) return num.toExponential(3);
      return parseFloat(num.toFixed(6)).toString();
    }
    return value.toString();
  };

  // ── Handlers ──
  const handleNumber = (num) => {
    const digit = num === ',' ? '.' : num;

    if (justCalculated) {
      setDisplay(digit === '.' ? '0.' : digit);
      setExpression('');
      setJustCalculated(false);
      return;
    }

    if (waitingForSecond) {
      setDisplay(digit === '.' ? '0.' : digit);
      setWaitingForSecond(false);
      return;
    }

    if (digit === '.') {
      if (display.includes('.')) return;
      setDisplay(display + '.');
      return;
    }

    if (display === '0' || display === '-0') {
      setDisplay(display.startsWith('-') ? '-' + digit : digit);
    } else {
      if (display.length >= 10) return;
      setDisplay(display + digit);
    }
  };

  const handleOperator = (op) => {
    const current = parseFloat(display);

    if (firstValue !== null && !waitingForSecond) {
      // Calcula encadeado
      const result = calculate(firstValue, current, operator);
      const resultStr = formatDisplay(result);
      setDisplay(resultStr);
      setFirstValue(result);
      setExpression(`${resultStr} ${opSymbol(op)}`);
    } else {
      setFirstValue(current);
      setExpression(`${formatDisplay(current)} ${opSymbol(op)}`);
    }

    setOperator(op);
    setWaitingForSecond(true);
    setJustCalculated(false);
  };

  const handleEqual = () => {
    if (firstValue === null || operator === null) return;
    const current = parseFloat(display);
    const result = calculate(firstValue, current, operator);
    const resultStr = formatDisplay(result);

    setExpression(`${expression} ${formatDisplay(current)} =`);
    setDisplay(resultStr);
    setFirstValue(null);
    setOperator(null);
    setWaitingForSecond(false);
    setJustCalculated(true);
  };

  const handleSpecial = (label) => {
    switch (label) {
      case 'AC':
        setDisplay('0');
        setExpression('');
        setFirstValue(null);
        setOperator(null);
        setWaitingForSecond(false);
        setJustCalculated(false);
        break;
      case '+/-':
        if (display !== '0') {
          setDisplay(
            display.startsWith('-') ? display.slice(1) : '-' + display
          );
        }
        break;
      case '%':
        const pct = parseFloat(display) / 100;
        setDisplay(formatDisplay(pct));
        break;
    }
  };

  // ── Utilidades ──
  const calculate = (a, b, op) => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b !== 0 ? a / b : 'Erro';
      default: return b;
    }
  };

  const opSymbol = (op) => {
    const map = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    return map[op] || op;
  };

  const handlePress = (btn) => {
    if (btn.type === 'number') handleNumber(btn.label);
    else if (btn.type === 'operator') handleOperator(btn.value || btn.label);
    else if (btn.type === 'equal') handleEqual();
    else if (btn.type === 'special') handleSpecial(btn.label);
  };

  // ── Estilo do botão por tipo ──
  const getBtnStyle = (type) => {
    switch (type) {
      case 'operator': return styles.btnOperator;
      case 'equal':    return styles.btnEqual;
      case 'special':  return styles.btnSpecial;
      default:         return styles.btnNumber;
    }
  };

  const getBtnTextStyle = (type) => {
    switch (type) {
      case 'operator': return styles.btnTextOperator;
      case 'equal':    return styles.btnTextEqual;
      case 'special':  return styles.btnTextSpecial;
      default:         return styles.btnTextNumber;
    }
  };

  // ────────────────────────────────────────────────
  //  Render
  // ────────────────────────────────────────────────
  return (
    <PaperProvider>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>

          {/* ── Display ── */}
          <Surface style={styles.displaySurface} elevation={4}>
            <Text style={styles.expressionText} numberOfLines={1}>
              {expression || ' '}
            </Text>
            <Text
              style={[
                styles.displayText,
                display.length > 8 && styles.displayTextSmall,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {display}
            </Text>
          </Surface>

          {/* ── Teclado ── */}
          <View style={styles.keyboard}>
            {BUTTONS.map((row, rowIdx) => (
              <View key={rowIdx} style={styles.row}>
                {row.map((btn) => (
                  <View
                    key={btn.label}
                    style={[styles.btnWrapper, btn.wide && styles.btnWideWrapper]}
                  >
                    <Button
                      mode="contained"
                      onPress={() => handlePress(btn)}
                      style={[styles.btn, getBtnStyle(btn.type), btn.wide && styles.btnWide]}
                      contentStyle={[styles.btnContent, btn.wide && styles.btnWideContent]}
                      labelStyle={[styles.btnLabel, getBtnTextStyle(btn.type)]}
                    >
                      {btn.label}
                    </Button>
                  </View>
                ))}
              </View>
            ))}
          </View>

          {/* ── Rodapé ── */}
          <Text style={styles.footer}>Soluções Mobile · UNISATC</Text>
        </View>
      </SafeAreaView>
    </PaperProvider>
  );
}

// ────────────────────────────────────────────────
//  Estilos
// ────────────────────────────────────────────────
const BTN_SIZE = 76;
const BTN_GAP  = 10;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
    justifyContent: 'flex-end',
  },

  // ── Display ──
  displaySurface: {
    backgroundColor: theme.colors.display,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginBottom: 24,
    minHeight: 130,
    justifyContent: 'flex-end',
  },
  expressionText: {
    color: theme.colors.subText,
    fontSize: 16,
    textAlign: 'right',
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  displayText: {
    color: theme.colors.displayText,
    fontSize: 64,
    fontWeight: '300',
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  displayTextSmall: {
    fontSize: 44,
  },

  // ── Teclado ──
  keyboard: {
    gap: BTN_GAP,
  },
  row: {
    flexDirection: 'row',
    gap: BTN_GAP,
    justifyContent: 'center',
  },

  // ── Botões ──
  btnWrapper: {
    width: BTN_SIZE,
    height: BTN_SIZE,
  },
  btnWideWrapper: {
    width: BTN_SIZE * 2 + BTN_GAP,
  },
  btn: {
    borderRadius: BTN_SIZE / 2,
    width: BTN_SIZE,
    height: BTN_SIZE,
    justifyContent: 'center',
    elevation: 3,
  },
  btnWide: {
    width: BTN_SIZE * 2 + BTN_GAP,
    borderRadius: BTN_SIZE / 2,
  },
  btnContent: {
    width: BTN_SIZE,
    height: BTN_SIZE,
  },
  btnWideContent: {
    width: BTN_SIZE * 2 + BTN_GAP,
  },
  btnLabel: {
    fontSize: 26,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 28,
  },

  // Número
  btnNumber: {
    backgroundColor: theme.colors.surface,
  },
  btnTextNumber: {
    color: theme.colors.number,
  },

  // Operador
  btnOperator: {
    backgroundColor: theme.colors.operator,
  },
  btnTextOperator: {
    color: theme.colors.operatorText,
  },

  // Igual
  btnEqual: {
    backgroundColor: theme.colors.equal,
  },
  btnTextEqual: {
    color: theme.colors.equalText,
  },

  // Especial (AC, +/-, %)
  btnSpecial: {
    backgroundColor: theme.colors.special,
  },
  btnTextSpecial: {
    color: theme.colors.specialText,
  },

  // ── Rodapé ──
  footer: {
    color: theme.colors.subText,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 16,
    letterSpacing: 1,
    opacity: 0.6,
  },
});