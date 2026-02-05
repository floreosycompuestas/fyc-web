'use client';

import { useEffect, useState } from 'react';
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
  Spinner,
  Input,
  Badge,
} from '@chakra-ui/react';
import { Card, CardBody } from '@chakra-ui/card';
import { FiArrowLeft, FiMail, FiUser } from 'react-icons/fi';
import Header from '@/app/components/layout/Header';
import Footer from '@/app/components/layout/Footer';

export default function ProfilePage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [editData, setEditData] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with actual API call to get user profile
        // const response = await fetch('/api/auth/me', {
        //   credentials: 'include',
        // });
        // if (!response.ok) throw new Error('Failed to fetch profile');
        // const userData = await response.json();
        // setUser(userData);
        // setEditData({
        //   email: userData.email,
        //   username: userData.username,
        //   first_name: userData.first_name || '',
        //   last_name: userData.last_name || '',
        // });

        // Mock user data for now
        const mockUser = {
          id: 1,
          email: 'user@example.com',
          username: 'johndoe',
          first_name: 'John',
          last_name: 'Doe',
          created_at: '2025-01-15',
          updated_at: '2026-01-16',
        };
        setUser(mockUser);
        setEditData({
          email: mockUser.email,
          username: mockUser.username,
          first_name: mockUser.first_name,
          last_name: mockUser.last_name,
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
        // Redirect to login if profile fetch fails
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

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

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);

    try {
      // TODO: Replace with actual API call to update profile
      // const response = await fetch('/api/auth/me', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(editData),
      //   credentials: 'include',
      // });
      // if (!response.ok) throw new Error('Failed to update profile');
      // const updatedUser = await response.json();
      // setUser(updatedUser);

      console.log('Saving profile:', editData);

      // Update user with edit data
      setUser((prev: any) => ({
        ...prev,
        ...editData,
      }));

      setIsEditing(false);
      alert('Profile updated successfully');
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setEditData({
        email: user.email,
        username: user.username,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="gray.50">
        <VStack gap={4}>
          <Spinner size="lg" color="blue.500" />
          <Text color="gray.600">Loading profile...</Text>
        </VStack>
      </Flex>
    );
  }

  if (!user) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="gray.50">
        <VStack gap={4}>
          <Heading size="md" color="gray.800">
            Profile not found
          </Heading>
          <Button colorScheme="blue" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </VStack>
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
      {/* Header Component */}
      <Header onLogout={handleLogout} />

      {/* Main Content */}
      <Container maxW="3xl" px={{ base: 4, md: 6 }} py={{ base: 8, md: 12 }}>
        {/* Header with Back Button */}
        <HStack gap={4} align="center" mb={{ base: 8, md: 10 }}>
          <Button variant="ghost" onClick={() => router.push('/dashboard')} _hover={{ bg: 'blue.50' }}>
            <FiArrowLeft style={{ marginRight: '8px' }} />
            Back
          </Button>
          <VStack align="flex-start" gap={0}>
            <Heading size={{ base: 'lg', md: '2xl' }} color="gray.900">
              My Profile
            </Heading>
            <Text fontSize="sm" color="gray.600">
              Manage your account information
            </Text>
          </VStack>
        </HStack>

        {/* Profile Information Card */}
        <Card boxShadow="lg" rounded="xl" overflow="hidden" borderWidth="1px" borderColor="gray.200" mb={6}>
          <CardBody py={{ base: 8, md: 10 }} px={{ base: 6, md: 8 }}>
            <VStack gap={8} align="stretch">
              {/* Profile Header */}
              <HStack justify="space-between" align="flex-start">
                <VStack align="flex-start" gap={1}>
              <Heading size="md" color="gray.900">
                Profile Information
              </Heading>
              <Text fontSize="sm" color="gray.600">
                {isEditing ? 'Update your details' : 'Your account details'}
              </Text>
            </VStack>
            <Button
              size="sm"
              colorScheme={isEditing ? 'gray' : 'blue'}
              variant="outline"
              onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </HStack>

          <Box height="1px" bg="gray.200" />

              {/* Form Fields */}
              <VStack gap={6} align="stretch">
                {/* Email */}
                <VStack gap={2} align="flex-start">
                  <HStack gap={2}>
                    <FiMail size={18} color="#718096" />
                    <Text fontSize="sm" fontWeight="600" color="white">
                      Email
                    </Text>
                  </HStack>
                  {isEditing ? (
                    <Input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleEditChange}
                      size="lg"
                      borderWidth="2px"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' }}
                      rounded="lg"
                      transition="all 0.2s"
                      w="100%"
                    />
                  ) : (
                    <Text fontSize="base" color="gray.800" fontWeight="500">
                      {user.email}
                    </Text>
                  )}
                </VStack>

                {/* Username */}
                <VStack gap={2} align="flex-start">
                  <HStack gap={2}>
                    <FiUser size={18} color="#718096" />
                    <Text fontSize="sm" fontWeight="600" color="white">
                      Username
                    </Text>
                  </HStack>
                  {isEditing ? (
                    <Input
                      type="text"
                      name="username"
                      value={editData.username}
                      onChange={handleEditChange}
                      size="lg"
                      borderWidth="2px"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' }}
                      rounded="lg"
                      transition="all 0.2s"
                      w="100%"
                    />
                  ) : (
                    <Text fontSize="base" color="gray.800" fontWeight="500">
                      {user.username}
                    </Text>
                  )}
                </VStack>

                {/* First Name */}
                <VStack gap={2} align="flex-start">
                  <Text fontSize="sm" fontWeight="600" color="white">
                    First Name
                  </Text>
                  {isEditing ? (
                    <Input
                      type="text"
                      name="first_name"
                      value={editData.first_name}
                      onChange={handleEditChange}
                      placeholder="Enter first name"
                      size="lg"
                      borderWidth="2px"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' }}
                      rounded="lg"
                      transition="all 0.2s"
                      w="100%"
                    />
                  ) : (
                    <Text fontSize="base" color={user.first_name ? 'gray.800' : 'gray.500'} fontWeight="500">
                      {user.first_name || 'Not set'}
                    </Text>
                  )}
                </VStack>

                {/* Last Name */}
                <VStack gap={2} align="flex-start">
                  <Text fontSize="sm" fontWeight="600" color="white">
                    Last Name
                  </Text>
                  {isEditing ? (
                    <Input
                      type="text"
                      name="last_name"
                      value={editData.last_name}
                      onChange={handleEditChange}
                      placeholder="Enter last name"
                      size="lg"
                      borderWidth="2px"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' }}
                      rounded="lg"
                      transition="all 0.2s"
                      w="100%"
                    />
                  ) : (
                    <Text fontSize="base" color={user.last_name ? 'gray.800' : 'gray.500'} fontWeight="500">
                      {user.last_name || 'Not set'}
                    </Text>
                  )}
                </VStack>
              </VStack>

              {isEditing && (
                <>
                  <Box height="1px" bg="gray.200" />
                  <HStack gap={3} justify="flex-end">
                    <Button variant="outline" onClick={handleCancel} size="lg" fontWeight="600">
                      Cancel
                    </Button>
                    <Button
                      colorScheme="blue"
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      size="lg"
                      fontWeight="600"
                      boxShadow="md"
                      _hover={{ boxShadow: 'lg' }}
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </HStack>
                </>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Account Details Card */}
        <Card boxShadow="sm" rounded="xl" borderWidth="1px" borderColor="gray.200">
          <CardBody py={{ base: 6, md: 8 }} px={{ base: 6, md: 8 }}>
            <VStack gap={6} align="stretch">
              <VStack align="flex-start" gap={1}>
                <Heading size="sm" color="gray.900">
                  Account Details
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  System information and account metadata
                </Text>
              </VStack>

              <VStack gap={4} align="stretch" py={4} borderTop="1px" borderColor="gray.100">
                {/* Account Created */}
                <HStack justify="space-between" py={2}>
                  <VStack align="flex-start" gap={0}>
                    <Text fontSize="sm" fontWeight="600" color="white">
                      Account Created
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Registration date
                    </Text>
                  </VStack>
                  <Text fontSize="sm" color="gray.800" fontWeight="500">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </HStack>

                <Box height="1px" bg="gray.100" />

                {/* Last Updated */}
                <HStack justify="space-between" py={2}>
                  <VStack align="flex-start" gap={0}>
                    <Text fontSize="sm" fontWeight="600" color="white">
                      Last Updated
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Last profile modification
                    </Text>
                  </VStack>
                  <Text fontSize="sm" color="gray.800" fontWeight="500">
                    {new Date(user.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </HStack>

                <Box height="1px" bg="gray.100" />

                {/* Account Status */}
                <HStack justify="space-between" py={2}>
                  <VStack align="flex-start" gap={0}>
                    <Text fontSize="sm" fontWeight="600" color="white">
                      Account Status
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Current account state
                    </Text>
                  </VStack>
                  <Badge colorScheme="green" px={3} py={1}>
                    Active
                  </Badge>
                </HStack>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </Container>

      {/* Professional Footer */}
      <Footer />
    </Box>
  );
}

