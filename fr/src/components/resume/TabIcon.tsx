
import React from 'react';
import IconProvider, { IconName } from '@/components/IconProvider';

interface TabIconProps {
  name: IconName;
  size?: number;
}

const TabIcon: React.FC<TabIconProps> = ({ name, size = 18 }) => {
  return <IconProvider name={name} size={size} />;
};

export default TabIcon;
