'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  VStack,
  HStack,
  Spinner,
  Input,
  Heading,
  Text,
  Flex,
} from '@chakra-ui/react';
import { Card, CardBody } from '@chakra-ui/card';
import { FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';
import Header from '@/app/components/layout/Header';
import Footer from '@/app/components/layout/Footer';

export default function DeleteBirdPage() {
  const router = useRouter();
  const params = useParams();
  const birdId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [bird] = useState<any>(null);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    // TODO: Fetch bird data from backend
    setIsLoading(false);
  }, [birdId, router]);

  useEffect(() => {
    // Auto-open delete modal when page loads
    if (!isLoading) {
      setIsDeleteModalOpen(true);
    }
  }, [isLoading]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
      router.push('/login');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      // TODO: Replace with actual API call to backend
      // const response = await fetch(`/api/birds/${birdId}`, {
      //   method: 'DELETE',
      //   credentials: 'include',
      // });
      // if (!response.ok) throw new Error('Failed to delete bird');

      console.log('Deleting bird with ID:', birdId);

      alert('Bird deleted successfully');

      setIsDeleteModalOpen(false);
      router.push('/birds');
    } catch (err) {
      console.error('Error deleting bird:', err);
      alert('Failed to delete bird');
      setIsDeleting(false);
    }
  };

  const handleModalClose = () => {
    setConfirmText('');
    setIsDeleteModalOpen(false);
    router.push('/birds');
  };

  const isConfirmationValid = confirmText === 'DELETE';
  const birdName = bird?.name || 'Unknown Bird';

  if (isLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="gray.50">
        <VStack gap={4}>
          <Spinner size="lg" color="blue.500" />
          <Text color="gray.600">Loading...</Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
      {/* Header Component */}
      <Header onLogout={handleLogout} />

      {/* Delete Confirmation Modal - Custom Implementation */}
      {isDeleteModalOpen && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0, 0, 0, 0.5)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1000}
          p={{ base: 4, md: 0 }}
        >
          {/* Modal Content Card */}
          <Box
            bg="white"
            borderRadius={{ base: '0', md: 'lg' }}
            borderLeft={{ base: 'none', md: '4px' }}
            borderLeftColor="red.500"
            maxW={{ base: '100%', md: '500px' }}
            w="100%"
            maxH="90vh"
            overflowY="auto"
            boxShadow="xl"
          >
            {/* Header with Icon */}
            <Box px={{ base: 6, md: 8 }} py={6} borderBottom="1px" borderColor="gray.200">
              <HStack gap={3} align="flex-start">
                <Box color="red.500" fontSize="24px" pt={1} flexShrink={0}>
                  <FiAlertTriangle />
                </Box>
                <VStack align="flex-start" gap={0} flex={1}>
                  <Heading size="md" color="red.600">
                    Delete Bird
                  </Heading>
                  <Text fontSize="sm" color="gray.600" fontWeight="400" mt={1}>
                    This action cannot be undone
                  </Text>
                </VStack>
              </HStack>
            </Box>

            {/* Body */}
            <VStack gap={6} align="stretch" px={{ base: 6, md: 8 }} py={6}>
              {/* Warning Box */}
              <Box bg="red.50" p={4} rounded="lg" borderLeft="4px" borderColor="red.500">
                <Text fontSize="sm" color="red.800" lineHeight="1.6">
                  You are about to permanently delete <strong>{birdName}</strong>. All associated data including breeding records and history will be lost forever.
                </Text>
              </Box>

              {/* What will be deleted */}
              <Box>
                <Heading size="sm" mb={3} color="gray.800">
                  What will be deleted:
                </Heading>
                <VStack align="flex-start" gap={2} pl={4}>
                  <HStack gap={2}>
                    <Box color="red.500" fontSize="sm">•</Box>
                    <Text fontSize="sm" color="gray.700">Bird profile and all details</Text>
                  </HStack>
                  <HStack gap={2}>
                    <Box color="red.500" fontSize="sm">•</Box>
                    <Text fontSize="sm" color="gray.700">Associated records and history</Text>
                  </HStack>
                  <HStack gap={2}>
                    <Box color="red.500" fontSize="sm">•</Box>
                    <Text fontSize="sm" color="gray.700">All breeding information</Text>
                  </HStack>
                </VStack>
              </Box>

              {/* Confirmation Input */}
              <Box>
                <Text fontSize="sm" fontWeight="600" color="gray.700" mb={2}>
                  Type confirmation
                </Text>
                <Text fontSize="xs" color="gray.500" mb={3}>
                  To confirm deletion, type <strong>DELETE</strong> below
                </Text>
                <Input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                  placeholder="Type DELETE to confirm"
                  size="lg"
                  borderWidth="2px"
                  borderColor={confirmText === 'DELETE' ? 'green.500' : 'gray.200'}
                  _focus={{
                    borderColor: confirmText === 'DELETE' ? 'green.500' : 'teal.500',
                    boxShadow: confirmText === 'DELETE' ? '0 0 0 3px rgba(34, 197, 94, 0.1)' : '0 0 0 3px rgba(8, 145, 178, 0.1)',
                  }}
                  _hover={{ borderColor: confirmText === 'DELETE' ? 'green.500' : 'gray.300' }}
                  rounded="lg"
                  fontWeight="600"
                  textAlign="center"
                  transition="all 0.2s"
                />
                {confirmText === 'DELETE' && (
                  <Text fontSize="xs" color="green.600" mt={2} fontWeight="500">
                    ✓ Ready to delete
                  </Text>
                )}
              </Box>
            </VStack>

            {/* Footer with Actions */}
            <HStack gap={3} p={{ base: 4, md: 6 }} borderTop="1px" borderColor="gray.200" justify="flex-end">
              <Button
                variant="outline"
                onClick={handleModalClose}
                disabled={isDeleting}
                size="lg"
                fontWeight="600"
                _hover={{ bg: 'gray.50' }}
              >
                Cancel
              </Button>
            <Button
              colorScheme="red"
              onClick={handleDelete}
              disabled={!isConfirmationValid || isDeleting}
              size="lg"
              fontWeight="600"
              boxShadow="md"
              _hover={{ boxShadow: 'lg' }}
              _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
            >
              {isDeleting ? 'Deleting...' : 'Delete Permanently'}
            </Button>
            </HStack>
          </Box>
        </Box>
      )}

      {/* Professional Footer */}
      <Footer />
    </Box>
  );
}


