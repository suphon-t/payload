'use client'
import type { ClientValidate } from 'payload/types'
import type { EmailField as EmailFieldType, FieldBase } from 'payload/types'

import { getTranslation } from '@payloadcms/translations'
import { FieldDescription } from '@payloadcms/ui/forms/FieldDescription'
import { FieldError } from '@payloadcms/ui/forms/FieldError'
import { FieldLabel } from '@payloadcms/ui/forms/FieldLabel'
import { useFieldProps } from '@payloadcms/ui/forms/FieldPropsProvider'
import React, { useCallback } from 'react'

import type { FormFieldBase } from '../shared/index.js'

import { useField } from '../../forms/useField/index.js'
import { withCondition } from '../../forms/withCondition/index.js'
import { useTranslation } from '../../providers/Translation/index.js'
import { fieldBaseClass } from '../shared/index.js'
import './index.scss'

export type EmailFieldProps = FormFieldBase & {
  autoComplete?: string
  label?: FieldBase['label']
  name?: string
  path?: string
  placeholder?: EmailFieldType['admin']['placeholder']
  width?: string
}

const EmailField: React.FC<EmailFieldProps> = (props) => {
  const {
    name,
    AfterInput,
    BeforeInput,
    CustomDescription,
    CustomError,
    CustomLabel,
    autoComplete,
    className,
    descriptionProps,
    errorProps,
    label,
    labelProps,
    path: pathFromProps,
    placeholder,
    readOnly: readOnlyFromProps,
    required,
    style,
    validate,
    width,
  } = props

  const { i18n } = useTranslation()

  const memoizedValidate: ClientValidate = useCallback(
    (value, options) => {
      if (typeof validate === 'function') {
        return validate(value, { ...options, required })
      }
    },
    [validate, required],
  )

  const { path: pathFromContext, readOnly: readOnlyFromContext } = useFieldProps()
  const readOnly = readOnlyFromProps || readOnlyFromContext

  const { path, setValue, showError, value } = useField({
    path: pathFromContext || pathFromProps || name,
    validate: typeof validate === 'function' ? memoizedValidate : undefined,
  })

  return (
    <div
      className={[fieldBaseClass, 'email', className, showError && 'error', readOnly && 'read-only']
        .filter(Boolean)
        .join(' ')}
      style={{
        ...style,
        width,
      }}
    >
      <FieldError CustomError={CustomError} path={path} {...(errorProps || {})} />
      <FieldLabel
        CustomLabel={CustomLabel}
        label={label}
        required={required}
        {...(labelProps || {})}
      />
      <div>
        {BeforeInput}
        <input
          autoComplete={autoComplete}
          disabled={readOnly}
          id={`field-${path.replace(/\./g, '__')}`}
          name={path}
          onChange={setValue}
          placeholder={getTranslation(placeholder, i18n)}
          type="email"
          value={(value as string) || ''}
        />
        {AfterInput}
      </div>
      {CustomDescription !== undefined ? (
        CustomDescription
      ) : (
        <FieldDescription {...(descriptionProps || {})} />
      )}
    </div>
  )
}

export const Email = withCondition(EmailField)