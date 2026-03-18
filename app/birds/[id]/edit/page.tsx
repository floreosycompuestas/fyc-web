'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Spinner,
  Input,
  createToaster,
  Toaster,
} from '@chakra-ui/react';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { Card, CardBody } from '@chakra-ui/card';
import { FiArrowLeft } from 'react-icons/fi';
import Header from '@/app/components/layout/Header';
import Footer from '@/app/components/layout/Footer';
import { fetchBirdById, updateBird } from '@/app/lib/api/birds';
import { Bird } from '@/app/types';

// Create toaster instance
const toaster = createToaster({
  placement: 'top',
  pauseOnPageIdle: true,
});

export default function EditBirdPage() {
  const router = useRouter();
  const params = useParams();
  const birdId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<{ band_id: string; name: string; sex: string } | null>(null);
  const [isAutoParsed, setIsAutoParsed] = useState(false);

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

  const [initialData, setInitialData] = useState(formData);
  const [allBirds, setAllBirds] = useState<Bird[]>([]);

  useEffect(() => {
    const fetchBird = async () => {
      try {
        const bird = await fetchBirdById(parseInt(birdId));

        // Fetch all birds to get parent band IDs
        const birdsResponse = await fetch('/api/birds', {
          credentials: 'include',
        });

        let fetchedFatherBandId = '';
        let fetchedMotherBandId = '';

        if (birdsResponse.ok) {
          const birds = await birdsResponse.json();
          setAllBirds(birds);

          // Find parent band IDs
          const fatherBird = birds.find((b: Bird) => b.id === bird.father_id);
          const motherBird = birds.find((b: Bird) => b.id === bird.mother_id);

          fetchedFatherBandId = fatherBird?.band_id || '';
          fetchedMotherBandId = motherBird?.band_id || '';
        }

        // Parse band_id to derive bird_year and bird_number if they're missing
        let derivedYear = bird.bird_year ? bird.bird_year.toString() : '';
        let derivedNumber = bird.bird_number ? bird.bird_number.toString() : '';
        let derivedDob = bird.dob ? bird.dob.split('T')[0] : '';

        // If bird_year or bird_number are missing, try to derive from band_id
        if ((!bird.bird_year || !bird.bird_number) && bird.band_id) {
          const parts = bird.band_id.toUpperCase().split('-');
          if (parts.length === 3) {
            const year = parts[1];
            const number = parts[2];

            // Validate year is 4-digit number
            const yearNum = parseInt(year);
            if (year.length === 4 && !isNaN(yearNum)) {
              const numberNum = parseInt(number);
              if (!isNaN(numberNum)) {
                if (!bird.bird_year) {
                  derivedYear = year;
                  console.log(`✓ Derived bird_year from band_id: ${year}`);
                }
                if (!bird.bird_number) {
                  derivedNumber = number;
                  console.log(`✓ Derived bird_number from band_id: ${numberNum}`);
                }
                // Set DOB to January 1st of year if missing
                if (!bird.dob) {
                  derivedDob = `${year}-01-01`;
                  console.log(`✓ Set default DOB: ${year}-01-01`);
                }
                setIsAutoParsed(true);
              }
            }
          }
        }

        const data = {
          band_id: bird.band_id,
          bird_year: derivedYear,
          bird_number: derivedNumber,
          name: bird.name || '',
          dob: derivedDob,
          sex: bird.sex || '',
          father_band_id: fetchedFatherBandId,
          mother_band_id: fetchedMotherBandId,
        };

        setFormData(data);
        setInitialData(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load bird data';
        console.error('Error fetching bird:', err);
        toaster.create({
          title: 'Failed to Load Bird',
          description: errorMessage,
          type: 'error',
          duration: 15000,
        });
        router.push('/birds');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBird();
  }, [birdId, router]);

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

  // Parse band_id to extract bird_year and bird_number
  // Format: BR001-2024-05 -> bird_year: 2024, bird_number: 5
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
          // Only parse and set values if bird_year or bird_number are missing
          const shouldParse = !formData.bird_year || !formData.bird_number;

          if (shouldParse) {
            setFormData((prev) => ({
              ...prev,
              // Only update bird_year if it's empty
              bird_year: prev.bird_year || year,
              // Only update bird_number if it's empty
              bird_number: prev.bird_number || number,
              // Only set dob to January 1st of the bird_year if not already set
              dob: prev.dob || `${year}-01-01`,
            }));

            setIsAutoParsed(true);
            console.log(`✓ Parsed band_id: breeder_code=${breederCode}, bird_year=${year}, bird_number=${numberNum}, dob=${year}-01-01`);
          }
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Convert band_id to uppercase as user types
    let processedValue = value;
    if (name === 'band_id') {
      processedValue = value.toUpperCase();

      // Parse band_id to auto-fill bird_year and bird_number
      parseBandId(processedValue);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields (band_id is required)
      if (!formData.band_id) {
        toaster.create({
          title: 'Band ID Required',
          description: 'Please fill in the Band ID (required field)',
          type: 'warning',
          duration: 4000,
        });
        setIsSubmitting(false);
        return;
      }


      // Prepare payload - only include fields that have changed
      const payload: any = {};

      // Check each field for changes and only include if different from initial data
      if (formData.band_id.toUpperCase() !== initialData.band_id.toUpperCase()) {
        payload.band_id = formData.band_id.toUpperCase();
      }

      if (formData.bird_year !== initialData.bird_year) {
        payload.bird_year = formData.bird_year ? parseInt(formData.bird_year) : null;
      }

      if (formData.bird_number !== initialData.bird_number) {
        payload.bird_number = formData.bird_number ? parseInt(formData.bird_number) : null;
      }

      if (formData.name !== initialData.name) {
        payload.name = formData.name || null;
      }

      if (formData.dob !== initialData.dob) {
        payload.dob = formData.dob || null;
      }

      if (formData.sex !== initialData.sex) {
        payload.sex = formData.sex || null;
      }

      if (formData.father_band_id.toUpperCase() !== initialData.father_band_id.toUpperCase()) {
        payload.father_band_id = formData.father_band_id ? formData.father_band_id.toUpperCase() : null;
      }

      if (formData.mother_band_id.toUpperCase() !== initialData.mother_band_id.toUpperCase()) {
        payload.mother_band_id = formData.mother_band_id ? formData.mother_band_id.toUpperCase() : null;
      }

      // If no fields changed, don't make the API call
      if (Object.keys(payload).length === 0) {
        console.log('No changes detected, skipping update');
        setIsSubmitting(false);
        return;
      }

      console.log('Updating bird with payload:', payload);
      await updateBird(parseInt(birdId), payload);

      // Set success message for visual feedback
      setSuccessMessage({
        band_id: formData.band_id,
        name: formData.name,
        sex: formData.sex,
      });

      // Update initial data to mark form as clean
      setInitialData(formData);

      // Clear success message after 5 seconds (stay on the form for more edits)
      setTimeout(() => {
        setSuccessMessage(null);
      }, 15000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update bird';
      console.error('Error updating bird:', err);
      toaster.create({
        title: 'Failed to Update Bird',
        description: `${errorMessage}. Please check your input and try again.`,
        type: 'error',
        duration: 15000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNavigate = () => {
    router.push(`/birds/${birdId}/delete`);
  };

  const isFormChanged = JSON.stringify(formData) !== JSON.stringify(initialData);



  if (isLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="gray.50">
        <VStack gap={4}>
          <Spinner size="lg" color="teal.500" />
          <Text color="gray.600">Loading...</Text>
        </VStack>
      </Flex>
    );
  }

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
      <Container maxW="2xl" px={{ base: 4, md: 6 }} py={{ base: 8, md: 12 }}>
        {/* Success Message */}
        {successMessage && (
          <Box
            bg="green.50"
            borderWidth="2px"
            borderColor="green.400"
            rounded="lg"
            p={6}
            mb={6}
            boxShadow="md"
            animation="fadeIn 0.3s ease-in"
          >
            <VStack gap={2} align="flex-start">
              <HStack gap={2}>
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
                  Bird Updated Successfully!
                </Heading>
              </HStack>
              <Box pl={8}>
                <Text fontSize="sm" color="green.700" fontWeight="500">
                  <strong>Band ID:</strong> {successMessage.band_id}
                </Text>
                {successMessage.name && (
                  <Text fontSize="sm" color="green.700" fontWeight="500">
                    <strong>Name:</strong> {successMessage.name}
                  </Text>
                )}
                {successMessage.sex && (
                  <Text fontSize="sm" color="green.700" fontWeight="500">
                    <strong>Sex:</strong> {successMessage.sex === 'M' ? 'Male' : successMessage.sex === 'F' ? 'Female' : successMessage.sex}
                  </Text>
                )}
                <Text fontSize="xs" color="green.600" mt={2}>
                  You can continue making changes if needed.
                </Text>
              </Box>
            </VStack>
          </Box>
        )}

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
              Edit Bird
            </Heading>
            <Text fontSize="sm" color="gray.500">
              Update bird information
            </Text>
          </VStack>
        </HStack>

        {/* Form Card */}
        <Card boxShadow="lg" rounded="xl" overflow="hidden" borderWidth="1px" borderColor="gray.200">
          <CardBody py={{base: 8, md: 10}} px={{base: 6, md: 8}}>
            <form onSubmit={handleSubmit}>
              <VStack gap={8} align="stretch">
                {/* Section 1: Essential Information */}
                <VStack gap={6} align="stretch">
                  <Box>
                    <Heading size="sm" color="teal.600" mb={2} fontSize="0.875rem" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">
                      Essential Information
                    </Heading>
                    <Box height="2px" bg="teal.100" rounded="full" width="40px" />
                  </Box>

                  {/* Band ID - Required */}
                  <FormControl isRequired>
                    <FormLabel fontSize={{ base: "sm", md: "base" }} fontWeight="600" color="gray.700" mb={2}>
                      Band ID
                      <Text as="span" color="red.500" ml={1}>*</Text>
                    </FormLabel>
                    <Input
                      type="text"
                      name="band_id"
                      value={formData.band_id}
                      onChange={handleInputChange}
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
                      Unique identifier for the bird (format: BREEDER-YYYY-NN)
                    </Text>
                  </FormControl>

                  {/* Bird Year */}
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "base" }} fontWeight="600" color="gray.700" mb={2}>
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
                      _focus={{ borderColor: 'teal.600', boxShadow: '0 0 0 3px rgba(8, 145, 178, 0.1)' }}
                      _hover={{ borderColor: 'teal.300' }}
                      rounded="lg"
                      transition="all 0.2s"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Year the bird was born (extracted from band ID)
                    </Text>
                  </FormControl>

                  {/* Bird Number */}
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "base" }} fontWeight="600" color="gray.700" mb={2}>
                      Bird Number
                    </FormLabel>
                    <Input
                      type="number"
                      name="bird_number"
                      value={formData.bird_number}
                      onChange={handleInputChange}
                      placeholder="e.g., 1"
                      size="lg"
                      borderWidth="2px"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'teal.600', boxShadow: '0 0 0 3px rgba(8, 145, 178, 0.1)' }}
                      _hover={{ borderColor: 'teal.300' }}
                      rounded="lg"
                      transition="all 0.2s"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Sequential number for the bird in the given year
                    </Text>
                  </FormControl>

                  {/* Bird Name */}
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "base" }} fontWeight="600" color="gray.700" mb={2}>
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
                      _focus={{ borderColor: 'teal.600', boxShadow: '0 0 0 3px rgba(8, 145, 178, 0.1)' }}
                      _hover={{ borderColor: 'teal.300' }}
                      rounded="lg"
                      transition="all 0.2s"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Optional: Give your bird a friendly name
                    </Text>
                  </FormControl>

                  {/* Sex */}
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "base" }} fontWeight="600" color="gray.700" mb={2}>
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
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(8, 145, 178, 0.1)';
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

                {/* Divider */}
                <Box height="1px" bg="gray.100" />

                {/* Section 2: Additional Details */}
                <VStack gap={6} align="stretch">
                  <Box>
                    <Heading size="sm" color="cyan.600" mb={2} fontSize="0.875rem" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">
                      Additional Details
                    </Heading>
                    <Box height="2px" bg="cyan.100" rounded="full" width="40px" />
                  </Box>

                  {/* Date of Birth */}
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "base" }} fontWeight="600" color="gray.700" mb={2}>
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
                      _focus={{ borderColor: 'teal.600', boxShadow: '0 0 0 3px rgba(8, 145, 178, 0.1)' }}
                      _hover={{ borderColor: 'teal.300' }}
                      rounded="lg"
                      transition="all 0.2s"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      When the bird was born
                    </Text>
                  </FormControl>

                  {/* Father Band ID */}
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "base" }} fontWeight="600" color="gray.700" mb={2}>
                      Father Band ID
                    </FormLabel>
                    <Input
                      type="text"
                      name="father_band_id"
                      value={formData.father_band_id}
                      onChange={handleInputChange}
                      placeholder="Enter father band ID"
                      size="lg"
                      borderWidth="2px"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'teal.600', boxShadow: '0 0 0 3px rgba(8, 145, 178, 0.1)' }}
                      _hover={{ borderColor: 'teal.300' }}
                      rounded="lg"
                      transition="all 0.2s"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Band ID of the father bird (if known)
                    </Text>
                  </FormControl>

                  {/* Mother Band ID */}
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "base" }} fontWeight="600" color="gray.700" mb={2}>
                      Mother Band ID
                    </FormLabel>
                    <Input
                      type="text"
                      name="mother_band_id"
                      value={formData.mother_band_id}
                      onChange={handleInputChange}
                      placeholder="Enter mother band ID"
                      size="lg"
                      borderWidth="2px"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'teal.600', boxShadow: '0 0 0 3px rgba(8, 145, 178, 0.1)' }}
                      _hover={{ borderColor: 'teal.300' }}
                      rounded="lg"
                      transition="all 0.2s"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Band ID of the mother bird (if known)
                    </Text>
                  </FormControl>
                </VStack>

                {/* Delete Section */}
                <VStack gap={4} pt={2}>
                  <Box w="100%" height="1px" bg="gray.200" />
                  <Box w="100%">
                    <Button
                      w="100%"
                      colorScheme="red"
                      variant="outline"
                      onClick={handleDeleteNavigate}
                      size="lg"
                      fontWeight="600"
                      _hover={{ bg: 'red.50', borderColor: 'red.400' }}
                      transition="all 0.2s"
                    >
                      Delete Bird
                    </Button>
                  </Box>
                </VStack>

                {/* Action Buttons */}
                <VStack gap={4} pt={4}>
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
                      colorScheme="teal"
                      type="submit"
                      disabled={isSubmitting || !isFormChanged}
                      size="lg"
                      fontWeight="600"
                      px={8}
                      boxShadow="md"
                      _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
                      _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                      transition="all 0.2s"
                    >
                      {isSubmitting ? 'Updating...' : 'Update Bird'}
                    </Button>
                  </HStack>
                </VStack>
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

