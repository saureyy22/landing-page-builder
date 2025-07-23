'use client';

import React from 'react';
import { ComponentInstance } from '@contentful-landing-page-builder/shared';
import ComponentRenderer from './ComponentRenderer';

interface ClientComponentRendererProps {
  component: ComponentInstance;
}

export default function ClientComponentRenderer({ component }: ClientComponentRendererProps) {
  return <ComponentRenderer component={component} />;
}