'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  createToaster,
  Toaster,
} from '@chakra-ui/react';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { Card, CardBody } from '@chakra-ui/card';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import Header from '@/app/components/layout/Header';
import Footer from '@/app/components/layout/Footer';

// Create toaster instance
const toaster = createToaster({
  placement: 'top',
  pauseOnPageIdle: true,
});

interface Bird {
  id: number;
  band_id: string;
  name?: string;
  sex: string;
}

export default function CreatePairPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<{
    cock_band_id: string;
    hen_band_id: string;
    season: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    cock_band_id: '',
    hen_band_id: '',
    season: new Date().getFullYear().toString(),
    clutch: '1',
    date_paired: new Date().toISOString().split('T')[0],
  });

  // Type-ahead state
  const [cockSuggestions, setCockSuggestions] = useState<Bird[]>([]);
  const [henSuggestions, setHenSuggestions] = useState<Bird[]>([]);
  const [showCockSuggestions, setShowCockSuggestions] = useState(false);
  const [showHenSuggestions, setShowHenSuggestions] = useState(false);

  // Debounce timers
  const [cockDebounceTimer, setCockDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [henDebounceTimer, setHenDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const handleLogout = () => {
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      if (cockDebounceTimer) clearTimeout(cockDebounceTimer);
      if (henDebounceTimer) clearTimeout(henDebounceTimer);
    };
  }, [cockDebounceTimer, henDebounceTimer]);

  // Fetch male birds for cock suggestions
  const fetchCockSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setCockSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`/api/birds/band/${query}/sex/M`, {
        credentials: 'include',
      });

      if (response.ok) {
        const birds = await response.json();
        setCockSuggestions(birds.slice(0, 10)); // Limit to 10 suggestions
      }
    } catch (error) {
      console.error('Error fetching cock suggestions:', error);
    }
  };

  // Fetch female birds for hen suggestions
  const fetchHenSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setHenSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`/api/birds/band/${query}/sex/F`, {
        credentials: 'include',
      });

      if (response.ok) {
        const birds = await response.json();
        setHenSuggestions(birds.slice(0, 10)); // Limit to 10 suggestions
      }
    } catch (error) {
      console.error('Error fetching hen suggestions:', error);
    }
  };

  // Handle cock band ID input change with debouncing
  const handleCockBandIdChange = (value: string) => {
    setFormData({ ...formData, cock_band_id: value });

    // Clear existing timer
    if (cockDebounceTimer) {
      clearTimeout(cockDebounceTimer);
    }

    // Set new timer - wait 300ms after user stops typing
    const timer = setTimeout(() => {
      fetchCockSuggestions(value);
    }, 300);

    setCockDebounceTimer(timer);
    setShowCockSuggestions(true);
  };

  // Handle hen band ID input change with debouncing
  const handleHenBandIdChange = (value: string) => {
    setFormData({ ...formData, hen_band_id: value });

    // Clear existing timer
    if (henDebounceTimer) {
      clearTimeout(henDebounceTimer);
    }

    // Set new timer - wait 300ms after user stops typing
    const timer = setTimeout(() => {
      fetchHenSuggestions(value);
    }, 300);

    setHenDebounceTimer(timer);
    setShowHenSuggestions(true);
  };

  // Handle cock suggestion selection
  const selectCockSuggestion = (bird: Bird) => {
    setFormData({ ...formData, cock_band_id: bird.band_id });
    setShowCockSuggestions(false);
    setCockSuggestions([]);
  };

  // Handle hen suggestion selection
  const selectHenSuggestion = (bird: Bird) => {
    setFormData({ ...formData, hen_band_id: bird.band_id });
    setShowHenSuggestions(false);
    setHenSuggestions([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.cock_band_id || !formData.hen_band_id) {
        toaster.create({
          title: 'Required Fields Missing',
          description: 'Please provide both cock and hen band IDs',
          type: 'warning',
          duration: 4000,
        });
        setIsSubmitting(false);
        return;
      }

      if (!formData.season) {
        toaster.create({
          title: 'Season Required',
          description: 'Please provide the breeding season',
          type: 'warning',
          duration: 4000,
        });
        setIsSubmitting(false);
        return;
      }

      // Prepare payload
      const payload = {
        cock_band_id: formData.cock_band_id.toUpperCase(),
        hen_band_id: formData.hen_band_id.toUpperCase(),
        season: parseInt(formData.season),
        clutch: formData.clutch ? parseInt(formData.clutch) : 1,
        date_paired: formData.date_paired || new Date().toISOString().split('T')[0],
      };

      console.log('Creating pair with payload:', payload);

      const response = await fetch('/api/pairs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create pair');
      }

      const createdPair = await response.json();
      console.log('Pair created successfully:', createdPair);

      // Set success message
      setSuccessMessage({
        cock_band_id: formData.cock_band_id,
        hen_band_id: formData.hen_band_id,
        season: formData.season,
      });

      // Reset form for next entry
      setFormData({
        cock_band_id: '',
        hen_band_id: '',
        season: new Date().getFullYear().toString(),
        clutch: '1',
        date_paired: new Date().toISOString().split('T')[0],
      });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create pair';
      console.error('Error creating pair:', err);
      toaster.create({
        title: 'Failed to Create Pair',
        description: errorMessage,
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
      {/* Toaster for notifications */}
      <Toaster toaster={toaster}>
        {(toast) => (
          <Box
            bg={toast.type === 'error' ? 'red.500' : toast.type === 'warning' ? 'orange.500' : 'green.500'}
            color="white"
            p={4}
            rounded="md"
            boxShadow="lg"
          >
            <VStack align="start" gap={1}>
              <Text fontWeight="bold">{toast.title}</Text>
              {toast.description && <Text fontSize="sm">{toast.description}</Text>}
            </VStack>
          </Box>
        )}
      </Toaster>

      {/* Header Component */}
      <Header onLogout={handleLogout} />

      {/* Main Content */}
      <Container maxW="container.md" py={{ base: 6, md: 10 }} flex="1">
        <VStack gap={6} align="stretch">
          {/* Back Button */}
          <Button
            onClick={() => router.push('/pairs')}
            variant="ghost"
            alignSelf="flex-start"
            color="gray.600"
            _hover={{ bg: 'gray.100', color: 'teal.600' }}
          >
            <FiArrowLeft style={{ marginRight: '8px' }} />
            Back to Pairs
          </Button>

          {/* Page Header */}
          <Box>
            <Heading
              size={{ base: 'lg', md: 'xl' }}
              color="gray.800"
              fontWeight="700"
              mb={2}
            >
              Create New Pair
            </Heading>
            <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>
              Register a new breeding pair for the season
            </Text>
          </Box>

          {/* Success Message */}
          {successMessage && (
            <Box
              bg="green.50"
              borderLeft="4px solid"
              borderColor="green.400"
              p={4}
              rounded="md"
            >
              <VStack align="start" gap={2}>
                <HStack>
                  <Box
                    bg="green.500"
                    rounded="full"
                    w={6}
                    h={6}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text color="white" fontWeight="bold" fontSize="sm">✓</Text>
                  </Box>
                  <Heading size="sm" color="green.800">
                    Pair Created Successfully!
                  </Heading>
                </HStack>
                <Box pl={8}>
                  <Text fontSize="sm" color="green.700" fontWeight="500">
                    <strong>Cock:</strong> {successMessage.cock_band_id}
                  </Text>
                  <Text fontSize="sm" color="green.700" fontWeight="500">
                    <strong>Hen:</strong> {successMessage.hen_band_id}
                  </Text>
                  <Text fontSize="sm" color="green.700" fontWeight="500">
                    <strong>Season:</strong> {successMessage.season}
                  </Text>
                  <Text fontSize="xs" color="green.600" mt={2}>
                    You can create another pair below.
                  </Text>
                </Box>
              </VStack>
            </Box>
          )}

          {/* Form Card */}
          <Card
            size="lg"
            boxShadow="xl"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <CardBody p={{ base: 6, md: 8 }}>
              <form onSubmit={handleSubmit}>
                <VStack gap={6} align="stretch">
                  {/* Cock Band ID */}
                  <FormControl isRequired position="relative">
                    <FormLabel fontSize={{ base: "sm", md: "base" }} fontWeight="600" color="gray.700" mb={2}>
                      Cock Band ID (Male)
                    </FormLabel>
                    <Input
                      name="cock_band_id"
                      value={formData.cock_band_id}
                      onChange={(e) => handleCockBandIdChange(e.target.value)}
                      onBlur={() => setTimeout(() => setShowCockSuggestions(false), 200)}
                      onFocus={() => formData.cock_band_id.length >= 2 && setShowCockSuggestions(true)}
                      placeholder="e.g., BR001-2026-001"
                      size="lg"
                      borderWidth="2px"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'teal.600', boxShadow: '0 0 0 3px rgba(8, 145, 178, 0.1)' }}
                      _hover={{ borderColor: 'teal.300' }}
                      rounded="lg"
                      transition="all 0.2s"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Type to search for existing male birds
                    </Text>

                    {/* Cock Suggestions */}
                    {showCockSuggestions && cockSuggestions.length > 0 && (
                      <Box
                        position="absolute"
                        top="100%"
                        left={0}
                        right={0}
                        mt={1}
                        bg="white"
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="md"
                        boxShadow="lg"
                        maxH="200px"
                        overflowY="auto"
                        zIndex={10}
                      >
                        {cockSuggestions.map((bird) => (
                          <Box
                            key={bird.id}
                            p={3}
                            cursor="pointer"
                            _hover={{ bg: 'teal.50' }}
                            onClick={() => selectCockSuggestion(bird)}
                            borderBottom="1px solid"
                            borderColor="gray.100"
                          >
                            <Text fontWeight="600" color="gray.800">
                              {bird.band_id}
                            </Text>
                            {bird.name && (
                              <Text fontSize="sm" color="gray.600">
                                {bird.name}
                              </Text>
                            )}
                          </Box>
                        ))}
                      </Box>
                    )}
                  </FormControl>

                  {/* Hen Band ID */}
                  <FormControl isRequired position="relative">
                    <FormLabel fontSize={{ base: "sm", md: "base" }} fontWeight="600" color="gray.700" mb={2}>
                      Hen Band ID (Female)
                    </FormLabel>
                    <Input
                      name="hen_band_id"
                      value={formData.hen_band_id}
                      onChange={(e) => handleHenBandIdChange(e.target.value)}
                      onBlur={() => setTimeout(() => setShowHenSuggestions(false), 200)}
                      onFocus={() => formData.hen_band_id.length >= 2 && setShowHenSuggestions(true)}
                      placeholder="e.g., BR001-2026-002"
                      size="lg"
                      borderWidth="2px"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'teal.600', boxShadow: '0 0 0 3px rgba(8, 145, 178, 0.1)' }}
                      _hover={{ borderColor: 'teal.300' }}
                      rounded="lg"
                      transition="all 0.2s"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Type to search for existing female birds
                    </Text>

                    {/* Hen Suggestions */}
                    {showHenSuggestions && henSuggestions.length > 0 && (
                      <Box
                        position="absolute"
                        top="100%"
                        left={0}
                        right={0}
                        mt={1}
                        bg="white"
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="md"
                        boxShadow="lg"
                        maxH="200px"
                        overflowY="auto"
                        zIndex={10}
                      >
                        {henSuggestions.map((bird) => (
                          <Box
                            key={bird.id}
                            p={3}
                            cursor="pointer"
                            _hover={{ bg: 'teal.50' }}
                            onClick={() => selectHenSuggestion(bird)}
                            borderBottom="1px solid"
                            borderColor="gray.100"
                          >
                            <Text fontWeight="600" color="gray.800">
                              {bird.band_id}
                            </Text>
                            {bird.name && (
                              <Text fontSize="sm" color="gray.600">
                                {bird.name}
                              </Text>
                            )}
                          </Box>
                        ))}
                      </Box>
                    )}
                  </FormControl>

                  {/* Season and Clutch Row */}
                  <Flex gap={4} direction={{ base: 'column', md: 'row' }}>
                    <FormControl isRequired flex={1}>
                      <FormLabel fontSize={{ base: "sm", md: "base" }} fontWeight="600" color="gray.700" mb={2}>
                        Season (Year)
                      </FormLabel>
                      <Input
                        type="number"
                        name="season"
                        value={formData.season}
                        onChange={handleInputChange}
                        placeholder="e.g., 2026"
                        size="lg"
                        borderWidth="2px"
                        borderColor="gray.200"
                        _focus={{ borderColor: 'teal.600', boxShadow: '0 0 0 3px rgba(8, 145, 178, 0.1)' }}
                        _hover={{ borderColor: 'teal.300' }}
                        rounded="lg"
                        transition="all 0.2s"
                      />
                    </FormControl>

                    <FormControl flex={1}>
                      <FormLabel fontSize={{ base: "sm", md: "base" }} fontWeight="600" color="gray.700" mb={2}>
                        Clutch Number
                      </FormLabel>
                      <Input
                        type="number"
                        name="clutch"
                        value={formData.clutch}
                        onChange={handleInputChange}
                        placeholder="1"
                        size="lg"
                        borderWidth="2px"
                        borderColor="gray.200"
                        _focus={{ borderColor: 'teal.600', boxShadow: '0 0 0 3px rgba(8, 145, 178, 0.1)' }}
                        _hover={{ borderColor: 'teal.300' }}
                        rounded="lg"
                        transition="all 0.2s"
                      />
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Leave as 1 for first clutch
                      </Text>
                    </FormControl>
                  </Flex>

                  {/* Date Paired */}
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "base" }} fontWeight="600" color="gray.700" mb={2}>
                      Date Paired
                    </FormLabel>
                    <Input
                      type="date"
                      name="date_paired"
                      value={formData.date_paired}
                      onChange={handleInputChange}
                      size="lg"
                      borderWidth="2px"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'teal.600', boxShadow: '0 0 0 3px rgba(8, 145, 178, 0.1)' }}
                      _hover={{ borderColor: 'teal.300' }}
                      rounded="lg"
                      transition="all 0.2s"
                    />
                  </FormControl>

                  {/* Submit Buttons */}
                  <Flex gap={3} pt={4} direction={{ base: 'column', md: 'row' }}>
                    <Button
                      type="submit"
                      colorScheme="teal"
                      size="lg"
                      loading={isSubmitting}
                      loadingText="Creating..."
                      flex={{ base: 'none', md: 1 }}
                      fontSize={{ base: 'md', md: 'lg' }}
                      fontWeight="600"
                      py={6}
                      boxShadow="md"
                      _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                      transition="all 0.2s"
                    >
                      <FiCheck style={{ marginRight: '8px' }} />
                      Create Pair
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => router.push('/pairs')}
                      flex={{ base: 'none', md: 1 }}
                      fontSize={{ base: 'md', md: 'lg' }}
                      fontWeight="600"
                      py={6}
                      borderWidth="2px"
                      _hover={{ bg: 'gray.50' }}
                    >
                      Cancel
                    </Button>
                  </Flex>
                </VStack>
              </form>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Professional Footer */}
      <Footer />
    </Box>
  );
}

