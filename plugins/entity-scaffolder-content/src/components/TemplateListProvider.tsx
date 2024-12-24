import {
  EntityKindFilter,
  EntityListProvider,
  useEntityList,
} from '@backstage/plugin-catalog-react';
import React, { PropsWithChildren, useEffect } from 'react';

const TemplateListProviderInner = (props: PropsWithChildren<{}>) => {
  const { updateFilters } = useEntityList();
  useEffect(() => {
    updateFilters({
      kind: new EntityKindFilter('template', ''),
    });
  }, [updateFilters]);

  return <>{props.children}</>;
};

export const TemplateListProvider = (props: PropsWithChildren<{}>) => (
  <EntityListProvider>
    <TemplateListProviderInner>{props.children}</TemplateListProviderInner>
  </EntityListProvider>
);
