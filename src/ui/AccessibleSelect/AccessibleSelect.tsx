import React, { useEffect, useImperativeHandle, useRef } from 'react';
import { Select as AntSelect } from 'antd';
import type { SelectProps } from 'antd';

/**
 * Select do antd para usar dentro de <Form.Item rules={[{ required }]}>.
 *
 * O Form.Item injeta `aria-required` na <div> raiz do Select, onde o atributo
 * não é permitido (axe: aria-allowed-attr). Aqui ele é movido para o
 * <input role="combobox"> interno, que é o elemento focável que o suporta.
 */
const AccessibleSelectBase = React.forwardRef<any, SelectProps<any>>((props, ref) => {
  const { 'aria-required': ariaRequired, ...rest } = props as SelectProps<any> & {
    'aria-required'?: boolean | 'true' | 'false';
  };
  const inner = useRef<any>(null);
  useImperativeHandle(ref, () => inner.current);

  useEffect(() => {
    const input: HTMLInputElement | null | undefined = inner.current?.nativeElement?.querySelector(
      'input[role="combobox"]'
    );
    if (!input) return;
    if (ariaRequired === true || ariaRequired === 'true') input.setAttribute('aria-required', 'true');
    else input.removeAttribute('aria-required');
  });

  return <AntSelect ref={inner} {...rest} />;
});
AccessibleSelectBase.displayName = 'AccessibleSelect';

export const Select = Object.assign(AccessibleSelectBase, {
  Option: AntSelect.Option,
  OptGroup: AntSelect.OptGroup,
});

export default Select;
