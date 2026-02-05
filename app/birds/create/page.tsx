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
  Input,
  Heading,
} from '@chakra-ui/react';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { Card, CardBody } from '@chakra-ui/card';
import { FiArrowLeft } from 'react-icons/fi';
import Header from '@/app/components/layout/Header';
import Footer from '@/app/components/layout/Footer';

export default function CreateBirdPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentBreederId, setCurrentBreederId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<{ band_id: string; name: string; sex: string } | null>(null);
  const [isAutoParsed, setIsAutoParsed] = useState(false);

  // Type-ahead lookup states
  const [fatherSuggestions, setFatherSuggestions] = useState<any[]>([]);
  const [motherSuggestions, setMotherSuggestions] = useState<any[]>([]);
  const [fatherLoading, setFatherLoading] = useState(false);
  const [motherLoading, setMotherLoading] = useState(false);
  const [showFatherDropdown, setShowFatherDropdown] = useState(false);
  const [showMotherDropdown, setShowMotherDropdown] = useState(false);

  const [formData, setFormData] = useState({
    band_id: '',
    bird_year: '',
    bird_number: '',
    name: '',
    dob: '',
    sex: '',
    father_band_id: '',
    mother_band_id: '',
  });

  useEffect(() => {
    // Fetch current breeder ID from backend
    const fetchCurrentBreeder = async () => {
      try {
        const response = await fetch('/api/breeders/me/breeder', {
          credentials: 'include',
        });
        if (response.ok) {
          const breeder = await response.json();
          setCurrentBreederId(breeder.id);
        }
      } catch (err) {
        console.error('Error fetching current breeder:', err);
      }
    };

    fetchCurrentBreeder();
  }, []);

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

  // Parse band_id to extract breeder_code, bird_year, and bird_number
  // Format: BR001-2024-05 -> breeder_code: BR001, bird_year: 2024, bird_number: 5
  const parseBandId = (bandId: string) => {
    // Reset auto-parse indicator if band_id is empty
    if (!bandId.trim()) {
      setIsAutoParsed(false);
      return;
    }

    const parts = bandId.toUpperCase().split('-');
    if (parts.length === 3) {
      const breederCode = parts[0];
      const year = parts[1];
      const number = parts[2];

      // Validate year is a 4-digit number
      const yearNum = parseInt(year);
      if (year.length === 4 && !isNaN(yearNum)) {
        // Validate number is numeric
        const numberNum = parseInt(number);
        if (!isNaN(numberNum)) {
          // Auto-fill bird_year and bird_number
          setFormData((prev) => ({
            ...prev,
            bird_year: year,
            bird_number: number,
            // Optionally set dob to January 1st of the bird_year if not already set
            dob: prev.dob || `${year}-01-01`,
          }));

          setIsAutoParsed(true);

          console.log(`✓ Parsed band_id: breeder_code=${breederCode}, bird_year=${year}, bird_number=${numberNum}, dob=${year}-01-01`);
        } else {
          setIsAutoParsed(false);
        }
      } else {
        setIsAutoParsed(false);
      }
    } else {
      setIsAutoParsed(false);
    }
  };

  // Debounced lookup for father/mother birds
  const lookupBirds = async (searchTerm: string, sex: 'M' | 'F', type: 'father' | 'mother') => {
    if (!searchTerm || searchTerm.length < 2) {
      if (type === 'father') {
        setFatherSuggestions([]);
        setShowFatherDropdown(false);
      } else {
        setMotherSuggestions([]);
        setShowMotherDropdown(false);
      }
      return;
    }

    if (type === 'father') {
      setFatherLoading(true);
    } else {
      setMotherLoading(true);
    }

    try {
      // Search for birds by breeder_id and sex, filtered by band_id pattern
      const response = await fetch(`/api/birds/breeder/${currentBreederId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const birds = await response.json();
        // Filter birds by sex AND band_id containing the search term
        const filtered = birds.filter((bird: any) =>
          bird.sex === sex &&
          bird.band_id &&
          bird.band_id.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (type === 'father') {
          setFatherSuggestions(filtered.slice(0, 10)); // Limit to 10 suggestions
          setShowFatherDropdown(filtered.length > 0);
        } else {
          setMotherSuggestions(filtered.slice(0, 10));
          setShowMotherDropdown(filtered.length > 0);
        }
      }
    } catch (err) {
      console.error(`Error looking up ${type} birds:`, err);
    } finally {
      if (type === 'father') {
        setFatherLoading(false);
      } else {
        setMotherLoading(false);
      }
    }
  };

  // Debounce timer
  useEffect(() => {
    if (!currentBreederId) return;

    const timer = setTimeout(() => {
      if (formData.father_band_id) {
        lookupBirds(formData.father_band_id, 'M', 'father');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [formData.father_band_id, currentBreederId]);

  useEffect(() => {
    if (!currentBreederId) return;

    const timer = setTimeout(() => {
      if (formData.mother_band_id) {
        lookupBirds(formData.mother_band_id, 'F', 'mother');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [formData.mother_band_id, currentBreederId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Convert band IDs to uppercase as user types
    let processedValue = value;
    if (name === 'band_id' || name === 'father_band_id' || name === 'mother_band_id') {
      processedValue = value.toUpperCase();
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Auto-parse band_id when it changes
    if (name === 'band_id') {
      parseBandId(processedValue);
    }

    // Show dropdown when typing in father/mother fields
    if (name === 'father_band_id' && processedValue.length >= 2) {
      setShowFatherDropdown(true);
    } else if (name === 'mother_band_id' && processedValue.length >= 2) {
      setShowMotherDropdown(true);
    }
  };

  const selectBird = (bandId: string, type: 'father' | 'mother') => {
    setFormData((prev) => ({
      ...prev,
      [type === 'father' ? 'father_band_id' : 'mother_band_id']: bandId,
    }));

    if (type === 'father') {
      setShowFatherDropdown(false);
    } else {
      setShowMotherDropdown(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields (band_id is required)
      if (!formData.band_id) {
        alert('⚠ Band ID Required\n\nPlease fill in the Band ID to create a bird');
        setIsSubmitting(false);
        return;
      }

      // Build payload with resolved IDs and current breeder
      // Convert band IDs to uppercase for consistency
      const payload = {
        band_id: formData.band_id.toUpperCase(),
        bird_year: formData.bird_year ? parseInt(formData.bird_year) : null,
        bird_number: formData.bird_number ? parseInt(formData.bird_number) : null,
        name: formData.name || null,
        dob: formData.dob || null,
        sex: formData.sex || null,
        father_band_id: formData.father_band_id ? formData.father_band_id.toUpperCase() : null,
        mother_band_id: formData.mother_band_id ? formData.mother_band_id.toUpperCase() : null,
        breeder_id: currentBreederId,
        owner_id: null,
      };

      // Call actual backend API
      const response = await fetch('/api/birds/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to create bird');
      }

      const createdBird = await response.json();
      console.log('Bird created successfully:', createdBird);

      // Set success message for visual feedback
      setSuccessMessage({
        band_id: formData.band_id,
        name: formData.name,
        sex: formData.sex,
      });

      // Reset form and stay on page
      setFormData({
        band_id: '',
        bird_year: '',
        bird_number: '',
        name: '',
        dob: '',
        sex: '',
        father_band_id: '',
        mother_band_id: '',
      });
      setIsAutoParsed(false);

      // Clear success message after 10 seconds
      setTimeout(() => setSuccessMessage(null), 10000);

      // Don't redirect - stay on the page for more birds
    } catch (err) {
      console.error('Error creating bird:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';

      // Enhanced error notification
      alert(`✗ Failed to Create Bird\n\n${errorMessage}\n\nPlease check your input and try again`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
      {/* Header Component */}
      <Header onLogout={handleLogout} />

      {/* Main Content */}
      <Container maxW="2xl" px={{ base: 4, md: 6 }} py={{ base: 8, md: 12 }}>
        {/* Header with Back Button */}
        <HStack gap={4} align="center" mb={{ base: 8, md: 10 }}>
          <Button
            variant="ghost"
            onClick={() => router.push('/birds')}
            _hover={{ bg: 'blue.50' }}
          >
            <FiArrowLeft style={{ marginRight: '8px' }} />
            Back
          </Button>
          <VStack align="flex-start" gap={0}>
            <Heading size={{ base: "lg", md: "2xl" }} color="gray.900">
              Create New Bird
            </Heading>
            <Text fontSize="sm" color="gray.500">
              Add a new bird to your collection
            </Text>
          </VStack>
        </HStack>

        {/* Success Message Display */}
        {successMessage && (
          <Box
            mb={6}
            p={4}
            bg="green.50"
            borderLeft="4px"
            borderColor="green.500"
            rounded="md"
            animation="slideIn 0.3s ease-in-out"
          >
            <HStack gap={3} align="start">
              <Text fontSize="2xl">✓</Text>
              <VStack align="start" gap={1}>
                <Text fontWeight="600" color="green.800">
                  Bird Created Successfully!
                </Text>
                <Text fontSize="sm" color="green.700">
                  <strong>Band ID:</strong> {successMessage.band_id}
                </Text>
                {successMessage.name && (
                  <Text fontSize="sm" color="green.700">
                    <strong>Name:</strong> {successMessage.name}
                  </Text>
                )}
                {successMessage.sex && (
                  <Text fontSize="sm" color="green.700">
                    <strong>Sex:</strong> {successMessage.sex === 'M' ? 'Male' : 'Female'}
                  </Text>
                )}
              </VStack>
            </HStack>
          </Box>
        )}

        {/* Form Card */}
        <Card boxShadow="lg" rounded="xl" overflow="hidden" borderWidth="1px" borderColor="gray.200">
          <CardBody py={{base: 8, md: 10}} px={{base: 6, md: 8}}>
            <form onSubmit={handleSubmit}>
              <VStack gap={8} align="stretch">
                <VStack gap={6} align="stretch">

                  {/* Band ID - Required */}
                  <FormControl isRequired>
                    <FormLabel fontSize={{ base: "sm", md: "base" }} fontWeight="600" color="white" mb={2}>
                      Band ID
                      <Text as="span" color="red.500" ml={1}>*</Text>
                    </FormLabel>
                    <Input
                      type="text"
                      name="band_id"
                      value={formData.band_id}
                      onChange={handleInputChange}
                      placeholder="e.g., BAND-2026-001"
                      size="lg"
                      borderWidth="2px"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' }}
                      _hover={{ borderColor: 'blue.300' }}
                      rounded="lg"
                      transition="all 0.2s"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Format: BREEDER-YEAR-NUMBER (e.g., BR001-2024-05)
                      <br />
                      Auto-fills bird year, number, and estimated birth date
                    </Text>
                  </FormControl>

                  {/* Bird Year */}
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "base" }} fontWeight="600" color="white" mb={2}>
                      Bird Year
                    </FormLabel>
                    <Input
                      type="number"
                      name="bird_year"
                      value={formData.bird_year}
                      onChange={handleInputChange}
                      placeholder="e.g., 2026"
                      size="lg"
                      borderWidth="2px"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' }}
                      _hover={{ borderColor: 'blue.300' }}
                      rounded="lg"
                      transition="all 0.2s"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Year the bird was banded
                    </Text>
                  </FormControl>

                  {/* Bird Number */}
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "base" }} fontWeight="600" color="white" mb={2}>
                      Bird Number
                    </FormLabel>
                    <Input
                      type="number"
                      name="bird_number"
                      value={formData.bird_number}
                      onChange={handleInputChange}
                      placeholder="e.g., 123"
                      size="lg"
                      borderWidth="2px"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' }}
                      _hover={{ borderColor: 'blue.300' }}
                      rounded="lg"
                      transition="all 0.2s"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Sequential number for the bird
                    </Text>
                  </FormControl>

                  {/* Bird Name */}
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "base" }} fontWeight="600" color="white" mb={2}>
                      Bird Name
                    </FormLabel>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Tweety"
                      size="lg"
                      borderWidth="2px"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' }}
                      _hover={{ borderColor: 'blue.300' }}
                      rounded="lg"
                      transition="all 0.2s"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Optional: Give your bird a friendly name
                    </Text>
                  </FormControl>

                  {/* Sex */}
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "base" }} fontWeight="600" color="white" mb={2}>
                      Sex
                    </FormLabel>
                    <select
                      name="sex"
                      value={formData.sex}
                      onChange={handleInputChange as any}
                      style={{
                        width: '100%',
                        borderWidth: '2px',
                        borderColor: '#cbd5e0',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        fontSize: '16px',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s',
                        backgroundColor: '#fff',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#3182ce';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#cbd5e0';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <option value="">Select sex</option>
                      <option value="M">Male (M)</option>
                      <option value="F">Female (F)</option>
                    </select>
                  </FormControl>
                </VStack>

                <VStack gap={6} align="stretch">
                  {/* Date of Birth */}
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "base" }} fontWeight="600" color="white" mb={2}>
                      Date of Birth
                    </FormLabel>
                    <Input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      size="lg"
                      borderWidth="2px"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' }}
                      _hover={{ borderColor: 'blue.300' }}
                      rounded="lg"
                      transition="all 0.2s"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      When the bird was born
                    </Text>
                  </FormControl>

                  {/* Father Band ID with Type-Ahead */}
                  <FormControl position="relative">
                    <FormLabel fontSize={{ base: "sm", md: "base" }} fontWeight="600" color="white" mb={2}>
                      Father Band ID
                    </FormLabel>
                    <Box position="relative">
                      <Input
                        type="text"
                        name="father_band_id"
                        value={formData.father_band_id}
                        onChange={handleInputChange}
                        onFocus={() => {
                          if (formData.father_band_id.length >= 2 && fatherSuggestions.length > 0) {
                            setShowFatherDropdown(true);
                          }
                        }}
                        onBlur={() => {
                          // Delay to allow click on dropdown
                          setTimeout(() => setShowFatherDropdown(false), 200);
                        }}
                        placeholder="Start typing band ID... e.g., BAND-2025"
                        size="lg"
                        borderWidth="2px"
                        borderColor="gray.200"
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' }}
                        _hover={{ borderColor: 'blue.300' }}
                        rounded="lg"
                        transition="all 0.2s"
                      />
                      {fatherLoading && (
                        <Box position="absolute" right="12px" top="50%" transform="translateY(-50%)">
                          <Text fontSize="sm" color="blue.500">🔍</Text>
                        </Box>
                      )}
                      {showFatherDropdown && fatherSuggestions.length > 0 && (
                        <Box
                          position="absolute"
                          top="100%"
                          left={0}
                          right={0}
                          mt={1}
                          bg="white"
                          border="1px solid"
                          borderColor="gray.200"
                          rounded="md"
                          boxShadow="lg"
                          maxH="200px"
                          overflowY="auto"
                          zIndex={1000}
                        >
                          {fatherSuggestions.map((bird) => (
                            <Box
                              key={bird.id}
                              px={4}
                              py={2}
                              cursor="pointer"
                              _hover={{ bg: 'blue.50' }}
                              onClick={() => selectBird(bird.band_id, 'father')}
                              borderBottom="1px solid"
                              borderColor="gray.100"
                            >
                              <Text fontWeight="600" fontSize="sm" color="gray.900">
                                {bird.band_id}
                              </Text>
                              {bird.name && (
                                <Text fontSize="xs" color="gray.600">
                                  {bird.name}
                                </Text>
                              )}
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Type to search for male birds (minimum 2 characters)
                    </Text>
                  </FormControl>

                  {/* Mother Band ID with Type-Ahead */}
                  <FormControl position="relative">
                    <FormLabel fontSize={{ base: "sm", md: "base" }} fontWeight="600" color="white" mb={2}>
                      Mother Band ID
                    </FormLabel>
                    <Box position="relative">
                      <Input
                        type="text"
                        name="mother_band_id"
                        value={formData.mother_band_id}
                        onChange={handleInputChange}
                        onFocus={() => {
                          if (formData.mother_band_id.length >= 2 && motherSuggestions.length > 0) {
                            setShowMotherDropdown(true);
                          }
                        }}
                        onBlur={() => {
                          // Delay to allow click on dropdown
                          setTimeout(() => setShowMotherDropdown(false), 200);
                        }}
                        placeholder="Start typing band ID... e.g., BAND-2025"
                        size="lg"
                        borderWidth="2px"
                        borderColor="gray.200"
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' }}
                        _hover={{ borderColor: 'blue.300' }}
                        rounded="lg"
                        transition="all 0.2s"
                      />
                      {motherLoading && (
                        <Box position="absolute" right="12px" top="50%" transform="translateY(-50%)">
                          <Text fontSize="sm" color="blue.500">🔍</Text>
                        </Box>
                      )}
                      {showMotherDropdown && motherSuggestions.length > 0 && (
                        <Box
                          position="absolute"
                          top="100%"
                          left={0}
                          right={0}
                          mt={1}
                          bg="white"
                          border="1px solid"
                          borderColor="gray.200"
                          rounded="md"
                          boxShadow="lg"
                          maxH="200px"
                          overflowY="auto"
                          zIndex={1000}
                        >
                          {motherSuggestions.map((bird) => (
                            <Box
                              key={bird.id}
                              px={4}
                              py={2}
                              cursor="pointer"
                              _hover={{ bg: 'blue.50' }}
                              onClick={() => selectBird(bird.band_id, 'mother')}
                              borderBottom="1px solid"
                              borderColor="gray.100"
                            >
                              <Text fontWeight="600" fontSize="sm" color="gray.900">
                                {bird.band_id}
                              </Text>
                              {bird.name && (
                                <Text fontSize="xs" color="gray.600">
                                  {bird.name}
                                </Text>
                              )}
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Type to search for female birds (minimum 2 characters)
                    </Text>
                  </FormControl>
                </VStack>

                {/* Action Buttons */}
                <HStack gap={4} justify="flex-end" w="100%">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/birds')}
                    size="lg"
                    fontWeight="600"
                    px={8}
                    borderWidth="2px"
                    _hover={{ bg: 'gray.50', borderColor: 'gray.400' }}
                    transition="all 0.2s"
                  >
                    Cancel
                  </Button>
                  <Button
                    colorScheme="blue"
                    type="submit"
                    disabled={isSubmitting}
                    size="lg"
                    fontWeight="600"
                    px={8}
                    boxShadow="md"
                    _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
                    _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                    transition="all 0.2s"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Bird'}
                  </Button>
                </HStack>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </Container>

      {/* Professional Footer */}
      <Footer />
    </Box>
  );
}

