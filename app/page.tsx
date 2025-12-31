"use client";

import {
  Box,
  Button,
  Container,
  Heading,
  Stack,
  Text,
  Flex,
  SimpleGrid,
  Icon,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GiEagleHead } from "react-icons/gi";
import { FiLogOut, FiLogIn } from "react-icons/fi";
import { FaChartLine, FaUsers, FaCog } from "react-icons/fa";

interface FeatureProps {
  icon: any;
  title: string;
  description: string;
}

const Feature = ({ icon, title, description }: FeatureProps) => (
  <VStack gap={3} alignItems="start">
    <Box
      p={3}
      bg="blue.50"
      borderRadius="lg"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Icon as={icon} w={6} h={6} color="blue.600" />
    </Box>
    <Heading size="md">{title}</Heading>
    <Text color="gray.600" fontSize="sm">
      {description}
    </Text>
  </VStack>
);

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        // Call our Next.js API route that can read HttpOnly cookies
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include", // Send cookies with request
        });

        console.log("Auth verify response status:", response.status);

        if (response.ok) {
          console.log("User is logged in");
          setIsLoggedIn(true);
        } else {
          console.log("User is not logged in");
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setIsLoggedIn(false);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <Box bg="gray.50" minH="100vh">
      {/* Navigation Bar */}
      <Box bg="white" boxShadow="sm" position="sticky" top={0} zIndex={10}>
        <Container maxW="7xl" py={{ base: 3, md: 4 }}>
          <Flex justifyContent="space-between" alignItems="center">
            <HStack gap={{ base: 1, md: 2 }}>
              <Icon as={GiEagleHead} w={{ base: 6, md: 8 }} h={{ base: 6, md: 8 }} color="blue.600" />
              <Heading size={{ base: "md", md: "lg" }} color="blue.600" cursor="pointer" onClick={() => router.push("/")}
>
                FYC
              </Heading>
            </HStack>
            {!isLoading && (
              isLoggedIn ? (
                <Button
                  colorScheme="red"
                  size="sm"
                  variant="outline"
                  onClick={handleLogout}
                >
                  <FiLogOut style={{ marginRight: '8px' }} />
                  Logout
                </Button>
              ) : (
                <Button
                  colorScheme="blue"
                  size="sm"
                  onClick={() => router.push("/login")}
                >
                  <FiLogIn style={{ marginRight: '8px' }} />
                  Login
                </Button>
              )
            )}
          </Flex>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" py={{ base: 12, md: 20 }} color="white">
        <Container maxW="7xl" px={{ base: 4, md: 6 }}>
          <Stack gap={{ base: 6, md: 8 }} textAlign="center">
            <Heading size={{ base: "xl", md: "2xl" }} fontWeight="bold">
              Welcome to FYC Spanish Timbrado Club
            </Heading>
            <Text fontSize={{ base: "md", md: "xl" }} opacity={0.9}>
              Professional Spanish Timbrado breeding and management system. Track, manage, and grow your Spanish Timbrado bloodlines with ease.
            </Text>
            <HStack justifyContent="center" gap={{ base: 2, md: 4 }} flexWrap={{ base: "wrap", md: "nowrap" }}>
              <Button
                size={{ base: "sm", md: "lg" }}
                bg="white"
                color="purple.600"
                _hover={{ bg: "gray.100" }}
                onClick={() => router.push("/signup")}
                w={{ base: "full", sm: "auto" }}
              >
                Get Started
              </Button>
              <Button
                size={{ base: "sm", md: "lg" }}
                variant="outline"
                borderColor="white"
                color="white"
                _hover={{ bg: "whiteAlpha.200" }}
                w={{ base: "full", sm: "auto" }}
                onClick={() => router.push("/about")}
              >
                Learn More
              </Button>
            </HStack>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW="7xl" py={{ base: 12, md: 20 }} px={{ base: 4, md: 6 }}>
        <VStack gap={{ base: 8, md: 12 }}>
          <VStack gap={{ base: 2, md: 4 }} textAlign="center">
            <Heading size={{ base: "lg", md: "xl" }}>Powerful Features</Heading>
            <Text color="gray.600" fontSize={{ base: "sm", md: "lg" }}>
              Everything you need to manage your Spanish Timbrado breeding program
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={{ base: 6, md: 8 }} w="full">
            <Feature
              icon={GiEagleHead}
              title="Spanish Timbrado Management"
              description="Track all your Spanish Timbrados with detailed profiles, genetics, and breeding history"
            />
            <Feature
              icon={FaChartLine}
              title="Analytics & Reports"
              description="Get insights into your breeding program with comprehensive analytics"
            />
            <Feature
              icon={FaUsers}
              title="Team Collaboration"
              description="Manage team members and control access to sensitive information"
            />
            <Feature
              icon={FaCog}
              title="Customizable"
              description="Tailor the system to your specific breeding program needs"
            />
          </SimpleGrid>
        </VStack>
      </Container>

      {/* CTA Section */}
      <Box bg="blue.600" color="white" py={{ base: 12, md: 16 }}>
        <Container maxW="7xl" px={{ base: 4, md: 6 }}>
          <Stack gap={{ base: 4, md: 6 }} textAlign="center">
              {isLoggedIn ? (
              <Heading size={{ base: "md", md: "lg" }}>You are part of the revolution!</Heading>
                ) : (
                <Heading size={{ base: "md", md: "lg" }}>Join the FYC Spanish Timbrado Club Today!</Heading>
                )}

            {isLoggedIn ? (
              <Text fontSize={{ base: "sm", md: "lg" }}>
                You've joined hundreds of breeders using FYC to manage their Spanish Timbrado programs
              </Text>
            ) : (
              <Text fontSize={{ base: "sm", md: "lg" }}>
                Create your account today and take your breeding to the next level!
              </Text>
            )}
            {!isLoggedIn && (
              <Button
                size={{ base: "sm", md: "lg" }}
                bg="white"
                color="blue.600"
                _hover={{ bg: "gray.100" }}
                w={{ base: "full", sm: "fit-content" }}
                mx={{ base: 0, sm: "auto" }}
                onClick={() => router.push("/signup")}
              >
                Sign up Now
              </Button>
            )}
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box bg="gray.800" color="gray.200" py={{ base: 6, md: 8 }}>
        <Container maxW="7xl" px={{ base: 4, md: 6 }}>
          <Flex
            justifyContent={{ base: "center", md: "space-between" }}
            alignItems="center"
            flexDirection={{ base: "column", md: "row" }}
            gap={{ base: 4, md: 0 }}
          >
            <Text fontSize={{ base: "xs", md: "sm" }} textAlign={{ base: "center", md: "left" }}>
              &copy; 2025 Spanish Timbrado Young Club. All rights reserved.
            </Text>
            <HStack gap={{ base: 3, md: 6 }} fontSize={{ base: "xs", md: "sm" }} flexWrap="wrap" justifyContent={{ base: "center", md: "flex-end" }}>
              <Text cursor="pointer" _hover={{ color: "white" }}>
                Privacy Policy
              </Text>
              <Text cursor="pointer" _hover={{ color: "white" }}>
                Terms of Service
              </Text>
              <Text cursor="pointer" _hover={{ color: "white" }}>
                Contact
              </Text>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}

