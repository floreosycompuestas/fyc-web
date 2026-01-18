'use client';

import {
  VStack,
  HStack,
  Box,
  Text,
  Button,
  Badge,
  Skeleton,
} from '@chakra-ui/react';
import { ReactNode } from 'react';

interface ListItem {
  id?: string | number;
  [key: string]: any;
}

interface EnhancedListProps<T extends ListItem> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  isLoading?: boolean;
  emptyMessage?: string;
  dividers?: boolean;
  hoverable?: boolean;
  spacing?: number;
  variant?: 'simple' | 'card' | 'bordered';
  maxH?: string;
  overflowY?: string;
}

export default function EnhancedList<T extends ListItem>({
  items,
  renderItem,
  isLoading = false,
  emptyMessage = 'No items found',
  dividers = true,
  hoverable = true,
  spacing = 0,
  variant = 'simple',
  maxH,
  overflowY,
}: EnhancedListProps<T>) {
  // Loading skeleton
  if (isLoading) {
    return (
      <VStack gap={spacing || 3} align="stretch">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} height="80px" rounded="md" />
        ))}
      </VStack>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <Box
        textAlign="center"
        py={12}
        px={4}
        bg="gray.50"
        rounded="lg"
        borderWidth="1px"
        borderStyle="dashed"
        borderColor="gray.300"
      >
        <Text color="gray.600" fontSize="sm" fontWeight="500">
          {emptyMessage}
        </Text>
      </Box>
    );
  }

  // Render based on variant
  if (variant === 'card') {
    return (
      <VStack
        gap={spacing || 4}
        align="stretch"
        maxH={maxH}
        overflowY={overflowY as any}
      >
        {items.map((item, idx) => (
          <Box
            key={item.id || idx}
            bg="white"
            rounded="lg"
            borderWidth="1px"
            borderColor="gray.200"
            p={5}
            boxShadow="sm"
            _hover={
              hoverable
                ? { boxShadow: 'md', transform: 'translateY(-2px)' }
                : {}
            }
            transition="all 0.2s"
          >
            {renderItem(item, idx)}
          </Box>
        ))}
      </VStack>
    );
  }

  if (variant === 'bordered') {
    return (
      <Box
        borderWidth="1px"
        borderColor="gray.200"
        rounded="lg"
        overflow="hidden"
        maxH={maxH}
        overflowY={overflowY as any}
      >
        <VStack gap={0} align="stretch">
          {items.map((item, idx) => (
            <Box
              key={item.id || idx}
              p={5}
              borderBottomWidth={
                idx < items.length - 1 && dividers ? '1px' : '0px'
              }
              borderColor="gray.100"
              _hover={
                hoverable ? { bg: 'gray.50', pl: 6 } : {}
              }
              transition="all 0.2s"
            >
              {renderItem(item, idx)}
            </Box>
          ))}
        </VStack>
      </Box>
    );
  }

  // Simple variant (default)
  return (
    <VStack
      gap={spacing || 3}
      align="stretch"
      maxH={maxH}
      overflowY={overflowY as any}
    >
      {items.map((item, idx) => (
        <Box
          key={item.id || idx}
          p={4}
          borderBottomWidth={
            dividers && idx < items.length - 1 ? '1px' : '0px'
          }
          borderColor="gray.100"
          _hover={
            hoverable
              ? { bg: 'gray.50', pl: 5, borderLeftWidth: '4px', borderLeftColor: 'blue.500' }
              : {}
          }
          transition="all 0.2s"
        >
          {renderItem(item, idx)}
        </Box>
      ))}
    </VStack>
  );
}

