'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  VStack,
  HStack,
  Spinner,
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

  const [formData, setFormData] = useState({
    band_id: '',
    name: '',
    dob: '',
    sex: '',
    father_band_id: '',
    mother_band_id: '',
  });

  const [lookupLoading, setLookupLoading] = useState({
    father: false,
    mother: false,
  });

  const [resolvedIds, setResolvedIds] = useState({
    father_id: '',
    mother_id: '',
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

  const lookupBirdIdByBandId = async (bandId: string, type: 'father' | 'mother') => {
    if (!bandId.trim()) {
      // Clear the resolved ID if band_id is empty
      setResolvedIds((prev) => ({
        ...prev,
        [type === 'father' ? 'father_id' : 'mother_id']: '',
      }));
      return;
    }

    setLookupLoading((prev) => ({ ...prev, [type]: true }));

    try {
      // TODO: Replace with actual API call to backend
      // const response = await fetch(`/api/birds/search?band_id=${encodeURIComponent(bandId)}`, {
      //   credentials: 'include',
      // });
      // if (!response.ok) throw new Error('Bird not found');
      // const bird = await response.json();
      // setResolvedIds((prev) => ({
      //   ...prev,
      //   [type === 'father' ? 'father_id' : 'mother_id']: bird.id,
      // }));

      // Mock implementation for now
      console.log(`Looking up bird with band_id: ${bandId}`);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // For demo: just use a mock ID based on band_id
      const mockId = Math.random().toString().slice(2, 5);
      setResolvedIds((prev) => ({
        ...prev,
        [type === 'father' ? 'father_id' : 'mother_id']: mockId,
      }));

      console.log(`Resolved ${type} band_id "${bandId}" to ID: ${mockId}`);
    } catch (err) {
      console.error(`Error looking up ${type}:`, err);
      alert(`Could not find bird with band_id: ${bandId}`);
      setResolvedIds((prev) => ({
        ...prev,
        [type === 'father' ? 'father_id' : 'mother_id']: '',
      }));
    } finally {
      setLookupLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Trigger lookup when father or mother band_id changes
    if (name === 'father_band_id') {
      lookupBirdIdByBandId(value, 'father');
    } else if (name === 'mother_band_id') {
      lookupBirdIdByBandId(value, 'mother');
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

      // Check if parent band_ids were entered but not resolved
      if (formData.father_band_id && !resolvedIds.father_id) {
        alert(`⚠ Father Bird Not Found\n\nCould not find a bird with band ID "${formData.father_band_id}". Please check and try again.`);
        setIsSubmitting(false);
        return;
      }

      if (formData.mother_band_id && !resolvedIds.mother_id) {
        alert(`⚠ Mother Bird Not Found\n\nCould not find a bird with band ID "${formData.mother_band_id}". Please check and try again.`);
        setIsSubmitting(false);
        return;
      }

      // Build payload with resolved IDs and current breeder
      const payload = {
        band_id: formData.band_id,
        name: formData.name,
        dob: formData.dob,
        sex: formData.sex,
        father_id: resolvedIds.father_id ? parseInt(resolvedIds.father_id) : null,
        mother_id: resolvedIds.mother_id ? parseInt(resolvedIds.mother_id) : null,
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

      // Enhanced success notification
      const birdDetails = `
✓ Bird Created Successfully!

Band ID: ${formData.band_id}
${formData.name ? `Name: ${formData.name}` : ''}
${formData.sex ? `Sex: ${formData.sex === 'M' ? 'Male' : 'Female'}` : ''}

Ready to create another bird or go back to the list.
      `.trim();

      //alert(birdDetails);

      // Set success message for visual feedback
      setSuccessMessage({
        band_id: formData.band_id,
        name: formData.name,
        sex: formData.sex,
      });

      // Reset form and stay on page
      setFormData({
        band_id: '',
        name: '',
        dob: '',
        sex: '',
        father_band_id: '',
        mother_band_id: '',
      });
      setResolvedIds({
        father_id: '',
        mother_id: '',
      });

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
                      Unique identifier for the bird
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

                  {/* Father Band ID */}
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "base" }} fontWeight="600" color="white" mb={2}>
                      Father Band ID
                    </FormLabel>
                    <HStack gap={2}>
                      <Input
                        type="text"
                        name="father_band_id"
                        value={formData.father_band_id}
                        onChange={handleInputChange}
                        placeholder="e.g., BAND-2025-001"
                        size="lg"
                        borderWidth="2px"
                        borderColor={resolvedIds.father_id ? 'green.500' : 'gray.200'}
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' }}
                        _hover={{ borderColor: resolvedIds.father_id ? 'green.500' : 'blue.300' }}
                        rounded="lg"
                        transition="all 0.2s"
                        flex={1}
                      />
                      {lookupLoading.father && (
                        <Spinner size="sm" color="blue.500" />
                      )}
                    </HStack>
                    {resolvedIds.father_id ? (
                      <Text fontSize="xs" color="green.600" mt={1} fontWeight="500">
                        ✓ Resolved to ID: {resolvedIds.father_id}
                      </Text>
                    ) : (
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Band ID of the father bird (if known)
                      </Text>
                    )}
                  </FormControl>

                  {/* Mother Band ID */}
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "base" }} fontWeight="600" color="white" mb={2}>
                      Mother Band ID
                    </FormLabel>
                    <HStack gap={2}>
                      <Input
                        type="text"
                        name="mother_band_id"
                        value={formData.mother_band_id}
                        onChange={handleInputChange}
                        placeholder="e.g., BAND-2025-002"
                        size="lg"
                        borderWidth="2px"
                        borderColor={resolvedIds.mother_id ? 'green.500' : 'gray.200'}
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' }}
                        _hover={{ borderColor: resolvedIds.mother_id ? 'green.500' : 'blue.300' }}
                        rounded="lg"
                        transition="all 0.2s"
                        flex={1}
                      />
                      {lookupLoading.mother && (
                        <Spinner size="sm" color="blue.500" />
                      )}
                    </HStack>
                    {resolvedIds.mother_id ? (
                      <Text fontSize="xs" color="green.600" mt={1} fontWeight="500">
                        ✓ Resolved to ID: {resolvedIds.mother_id}
                      </Text>
                    ) : (
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Band ID of the mother bird (if known)
                      </Text>
                    )}
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

