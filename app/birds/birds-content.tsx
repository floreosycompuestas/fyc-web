'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Flex,
} from '@chakra-ui/react';
import { Card, CardBody } from '@chakra-ui/card';
import { FiPlus, FiArrowLeft, FiEdit2, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import { EnhancedList, ListItemCard } from '@/app/components/ui';
import { Bird, Breeder } from '@/app/types';
import { fetchCurrentBreeder, fetchBirdsByBreeder } from '@/app/lib/api';
import { API_ENDPOINTS } from '@/app/lib/constants';
import Header from '@/app/components/layout/Header';
import Footer from '@/app/components/layout/Footer';

export default function BirdsContent() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [breeder, setBreeder] = useState<Breeder | null>(null);
  const [birds, setBirds] = useState<Bird[]>([]);

  useEffect(() => {
    const fetchBirdsForBreeder = async () => {
      try {
        setError(null);

        // Fetch the breeder for the current user
        const breederData = await fetchCurrentBreeder();
        setBreeder(breederData);
        const breederId = breederData.id;

        // Fetch birds for this breeder
        const birdsData = await fetchBirdsByBreeder(breederId);
        setBirds(birdsData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        console.error('Error fetching breeder birds:', err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBirdsForBreeder();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) console.error('Logout failed');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      router.push('/login');
    }
  };

  if (isLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="gray.50">
        <VStack gap={4}>
          <Box as="span" fontSize="3xl">⏳</Box>
          <Text color="gray.600">Loading birds...</Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
      {/* Header Component */}
      <Header onLogout={handleLogout} />

      <Container maxW="7xl" px={{ base: 4, md: 6 }} py={{ base: 8, md: 12 }}>
        <HStack justify="space-between" align="center" mb={{ base: 6, md: 8 }}>
          <HStack gap={4} align="center">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              _hover={{ bg: 'teal.50' }}
            >
              <FiArrowLeft style={{ marginRight: '8px' }} />
              Back
            </Button>
            <VStack align="flex-start" gap={0}>
              <Heading size={{ base: 'lg', md: '2xl' }} color="gray.800">
                {breeder ? `${breeder.first_name} ${breeder.last_name}'s Birds` : 'Birds'}
              </Heading>
              <Text fontSize="sm" color="gray.500">
                Manage and track your Spanish Timbrado birds
              </Text>
            </VStack>
          </HStack>
          <Button
            colorScheme="teal"
            size="md"
            onClick={() => router.push('/birds/create')}
          >
            <FiPlus style={{ marginRight: '8px' }} />
            Add Bird
          </Button>
        </HStack>

        {error ? (
          <Card borderLeft="4px" borderColor="red.500" bg="red.50">
            <CardBody>
              <HStack gap={4} align="flex-start">
                <Box color="red.500" pt={1}>
                  <FiAlertCircle size={24} />
                </Box>
                <VStack align="flex-start" gap={2}>
                  <Heading size="sm" color="red.600">
                    Error Loading Birds
                  </Heading>
                  <Text color="red.700" fontSize={{ base: 'sm', md: 'base' }}>
                    {error}
                  </Text>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        ) : (
          <EnhancedList<Bird>
            items={birds}
            variant="card"
            hoverable={true}
            spacing={4}
            emptyMessage="No birds yet. Click 'Create Bird' to add a new bird."
            renderItem={(bird) => (
              <ListItemCard
                title={bird.name || bird.band_id}
                subtitle={`Band ID: ${bird.band_id}`}
                metadata={[
                  {
                    label: 'Species',
                    value: 'Spanish Timbrado',
                  },
                  bird.sex && {
                    label: 'Sex',
                    value: bird.sex === 'M' ? 'Male' : bird.sex === 'F' ? 'Female' : bird.sex,
                  },
                  bird.dob && {
                    label: 'DOB',
                    value: new Date(bird.dob).toLocaleDateString(),
                  },
                ].filter(Boolean) as any}
                actions={[
                  {
                    icon: <FiEdit2 />,
                    colorScheme: "teal",
                    variant: 'outline',
                    onClick: () => router.push(`/birds/${bird.id}/edit`),
                  },
                  {
                    icon: <FiTrash2 />,
                    colorScheme: 'red',
                    variant: 'outline',
                    onClick: () => router.push(`/birds/${bird.id}/delete`),
                  },
                ]}
              />
            )}
          />
        )}
      </Container>

      {/* Professional Footer */}
      <Footer />
    </Box>
  );
}

