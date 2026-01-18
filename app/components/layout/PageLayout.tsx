'use client';

import { ReactNode } from 'react';
import { Box, Container, Flex, VStack, Spinner, Text } from '@chakra-ui/react';
import Header from './Header';
import Footer from './Footer';

interface PageLayoutProps {
  children: ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  onLogout: () => void;
  maxWidth?: string;
}

export default function PageLayout({
  children,
  isLoading = false,
  loadingText = 'Loading...',
  onLogout,
  maxWidth = '7xl',
}: PageLayoutProps) {
  if (isLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="gray.50">
        <VStack gap={4}>
          <Spinner size="lg" color="blue.500" />
          <Text color="gray.600">{loadingText}</Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
      <Header onLogout={onLogout} />
      <Container maxW={maxWidth} px={{ base: 4, md: 6 }} py={{ base: 8, md: 12 }} flex="1">
        {children}
      </Container>
      <Footer />
    </Box>
  );
}

