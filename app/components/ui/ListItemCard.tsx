'use client';

import {
  HStack,
  VStack,
  Box,
  Text,
  Button,
  Badge,
  Icon,
  Heading,
} from '@chakra-ui/react';
import { ReactNode } from 'react';
import { FiEdit2, FiTrash2, FiChevronRight } from 'react-icons/fi';

interface ListItemCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  status?: {
    label: string;
    colorScheme: string;
  };
  metadata?: Array<{
    label: string;
    value: string | number;
  }>;
  actions?: Array<{
    label?: string;
    icon?: ReactNode;
    onClick: () => void;
    colorScheme?: string;
    variant?: 'solid' | 'outline' | 'ghost';
  }>;
  onClick?: () => void;
  isClickable?: boolean;
  children?: ReactNode;
  image?: ReactNode;
  footer?: ReactNode;
}

export default function ListItemCard({
  title,
  subtitle,
  description,
  status,
  metadata = [],
  actions = [],
  onClickItem,
  isClickable = false,
  children,
  image,
  footer,
}: ListItemCardProps & { onClickItem?: () => void }) {
  return (
    <Box
      bg="white"
      rounded="lg"
      borderWidth="1px"
      borderColor="gray.200"
      overflow="hidden"
      boxShadow="sm"
      transition="all 0.2s"
      _hover={
        isClickable || onClickItem
          ? {
              boxShadow: 'md',
              borderColor: 'blue.200',
              transform: 'translateY(-2px)',
              cursor: 'pointer',
            }
          : {}
      }
      onClick={onClickItem}
    >
      {/* Header */}
      <HStack
        p={5}
        justify="space-between"
        align="flex-start"
        borderBottomWidth="1px"
        borderColor="gray.100"
        gap={4}
      >
        <VStack align="flex-start" gap={1} flex={1}>
          <Heading
            size="sm"
            color="gray.900"
            fontWeight="600"
          >
            {title}
          </Heading>
          {subtitle && (
            <Text fontSize="xs" color="gray.500" fontWeight="500">
              {subtitle}
            </Text>
          )}
        </VStack>
        {status && (
          <Badge colorScheme={status.colorScheme} px={3} py={1}>
            {status.label}
          </Badge>
        )}
      </HStack>

      {/* Content */}
      <VStack align="stretch" gap={0} px={5} py={4}>
        {description && (
          <Text color="gray.700" fontSize="sm" mb={3}>
            {description}
          </Text>
        )}

        {/* Metadata */}
        {metadata.length > 0 && (
          <HStack
            gap={4}
            flexWrap="wrap"
            mb={3}
            pb={3}
            borderBottomWidth="1px"
            borderColor="gray.100"
          >
            {metadata.map((item, idx) => (
              <HStack key={idx} gap={2}>
                <Text fontSize="xs" color="gray.600" fontWeight="600">
                  {item.label}:
                </Text>
                <Text fontSize="sm" color="gray.800" fontWeight="500">
                  {item.value}
                </Text>
              </HStack>
            ))}
          </HStack>
        )}

        {children}
      </VStack>

      {/* Actions */}
      {actions.length > 0 && (
        <>
          <Box borderTopWidth="1px" borderColor="gray.200" />
          <HStack p={3} gap={2} justify="flex-end" bg="gray.50">
            {actions.map((action, idx) => (
              <Button
                key={idx}
                size="sm"
                colorScheme={action.colorScheme || 'gray'}
                variant={action.variant || 'ghost'}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
              >
                {action.icon && <span style={{ marginRight: '6px' }}>{action.icon}</span>}
                {action.label}
              </Button>
            ))}
          </HStack>
        </>
      )}

      {/* Footer */}
      {footer && (
        <>
          <Box borderTopWidth="1px" borderColor="gray.200" />
          <Box p={3} bg="gray.50" fontSize="xs" color="gray.600">
            {footer}
          </Box>
        </>
      )}
    </Box>
  );
}

