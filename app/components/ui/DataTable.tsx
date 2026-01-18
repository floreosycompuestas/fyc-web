'use client';

import {
  Box,
  Badge,
  HStack,
  VStack,
  Text,
  Button,
} from '@chakra-ui/react';
import { ReactNode } from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | string;
  cell?: (value: any, row: T) => ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  variant?: 'simple' | 'striped' | 'unstyled';
  colorScheme?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function DataTable<T extends { id?: number | string }>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data available',
  variant = 'striped',
  colorScheme = 'gray',
  size = 'md',
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Text color="gray.500">Loading...</Text>
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Box
        textAlign="center"
        py={10}
        px={4}
        bg="gray.50"
        rounded="lg"
        borderWidth="1px"
        borderColor="gray.200"
      >
        <Text color="gray.600" fontSize="sm">
          {emptyMessage}
        </Text>
      </Box>
    );
  }

  const getCellValue = (row: T, column: Column<T>) => {
    if (column.cell) {
      return column.cell(
        typeof column.accessor === 'string'
          ? (row as any)[column.accessor]
          : row[column.accessor],
        row
      );
    }
    return typeof column.accessor === 'string'
      ? (row as any)[column.accessor]
      : row[column.accessor];
  };

  return (
    <Box
      overflowX="auto"
      borderRadius="lg"
      boxShadow="sm"
      borderWidth="1px"
      borderColor="gray.200"
    >
      {/* Header */}
      <Box
        display="grid"
        gridTemplateColumns={`repeat(${columns.length}, 1fr)`}
        bg={`${colorScheme}.50`}
        borderBottomWidth="2px"
        borderColor={`${colorScheme}.200`}
      >
        {columns.map((column, idx) => (
          <Box
            key={idx}
            p={6}
            fontWeight="700"
            fontSize="sm"
            color={`${colorScheme}.700`}
            textTransform="uppercase"
            letterSpacing="0.5px"
          >
            {column.header}
          </Box>
        ))}
      </Box>

      {/* Rows */}
      {data.map((row, rowIdx) => (
        <Box
          key={row.id || rowIdx}
          display="grid"
          gridTemplateColumns={`repeat(${columns.length}, 1fr)`}
          borderBottomWidth="1px"
          borderColor="gray.100"
          _hover={{ bg: `${colorScheme}.50` }}
          transition="background-color 0.2s"
        >
          {columns.map((column, colIdx) => (
            <Box
              key={colIdx}
              p={6}
              fontSize={size === 'sm' ? 'xs' : size === 'lg' ? 'base' : 'sm'}
              color="gray.700"
              display="flex"
              alignItems="center"
            >
              {getCellValue(row, column)}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}

