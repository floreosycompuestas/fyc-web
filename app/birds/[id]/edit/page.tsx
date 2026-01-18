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
} from '@chakra-ui/react';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { Card, CardBody } from '@chakra-ui/card';
import { FiArrowLeft } from 'react-icons/fi';
import Header from '@/app/components/layout/Header';
import Footer from '@/app/components/layout/Footer';

export default function EditBirdPage() {
  const router = useRouter();
  const params = useParams();
  const birdId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    band_id: '',
    name: '',
    dob: '',
    sex: '',
    father_id: '',
    mother_id: '',
  });

  const [initialData, setInitialData] = useState(formData);

  useEffect(() => {
    // TODO: Fetch bird data from backend
    // const fetchBird = async () => {
    //   try {
    //     const response = await fetch(`/api/birds/${birdId}`, {
    //       credentials: 'include',
    //     });
    //     if (!response.ok) throw new Error('Failed to fetch bird');
    //     const bird = await response.json();
    //     setFormData(bird);
    //     setInitialData(bird);
    //   } catch (err) {
    //     console.error('Error fetching bird:', err);
    //     alert('Failed to load bird data');
    //     router.push('/birds');
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // fetchBird();

    // For now, just set loading to false
    setIsLoading(false);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields (band_id is required)
      if (!formData.band_id) {
        alert('Please fill in the Band ID (required field)');
        setIsSubmitting(false);
        return;
      }

      // TODO: Replace with actual API call to backend
      // const response = await fetch(`/api/birds/${birdId}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      //   credentials: 'include',
      // });
      // if (!response.ok) throw new Error('Failed to update bird');

      console.log('Updating bird:', formData);

      alert('Bird updated successfully');

      // Update initial data to mark form as clean
      setInitialData(formData);

      router.push('/birds');
    } catch (err) {
      console.error('Error updating bird:', err);
      alert('Failed to update bird');
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
                      placeholder="e.g., BAND-2026-001"
                      size="lg"
                      borderWidth="2px"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'teal.600', boxShadow: '0 0 0 3px rgba(8, 145, 178, 0.1)' }}
                      _hover={{ borderColor: 'teal.300' }}
                      rounded="lg"
                      transition="all 0.2s"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Unique identifier for the bird
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

                  {/* Father ID */}
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "base" }} fontWeight="600" color="gray.700" mb={2}>
                      Father ID
                    </FormLabel>
                    <Input
                      type="number"
                      name="father_id"
                      value={formData.father_id}
                      onChange={handleInputChange}
                      placeholder="Enter father bird ID"
                      size="lg"
                      borderWidth="2px"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'teal.600', boxShadow: '0 0 0 3px rgba(8, 145, 178, 0.1)' }}
                      _hover={{ borderColor: 'teal.300' }}
                      rounded="lg"
                      transition="all 0.2s"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      ID of the father bird (if known)
                    </Text>
                  </FormControl>

                  {/* Mother ID */}
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "base" }} fontWeight="600" color="gray.700" mb={2}>
                      Mother ID
                    </FormLabel>
                    <Input
                      type="number"
                      name="mother_id"
                      value={formData.mother_id}
                      onChange={handleInputChange}
                      placeholder="Enter mother bird ID"
                      size="lg"
                      borderWidth="2px"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'teal.600', boxShadow: '0 0 0 3px rgba(8, 145, 178, 0.1)' }}
                      _hover={{ borderColor: 'teal.300' }}
                      rounded="lg"
                      transition="all 0.2s"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      ID of the mother bird (if known)
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

