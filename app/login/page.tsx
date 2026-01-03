"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  Link,
  Stack,
  Text,
  VStack,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Alert } from "@chakra-ui/alert";
import { Divider } from "@chakra-ui/layout";
import { Checkbox } from "@chakra-ui/checkbox";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";

export default function LoginPage() {
  const router = useRouter();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if user is already logged in
  useEffect(() => {
    // Try to fetch user profile to verify authentication
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        // If successful (200), user is logged in - redirect to dashboard
        if (response.ok) {
          router.push("/dashboard");
        }
        // If 401 or other error, user is not logged in - show login form
      } catch (err) {
        // Network error, show login form
        console.error("Auth check error:", err);
      }
    };

    checkAuth();
  }, [router]);


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ Include cookies (HttpOnly)
        body: JSON.stringify({
          username_or_email: usernameOrEmail,
          password: password,
          remember_me: rememberMe, // ✅ Send remember_me flag
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.detail || "Login failed. Please try again.");
        return;
      }

      // ✅ Tokens are now stored in HttpOnly cookies by backend
      // Backend extends expiration if remember_me is true
      router.push("/dashboard");
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Flex minH="100vh" align="center" justify="center" bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" px={{ base: 4, md: 0 }}>
      <Container maxW={{ base: "sm", sm: "md" }} px={{ base: 0, md: 4 }}>
        <VStack gap={{ base: 4, md: 6 }} w="100%">
          {/* Brand Header */}
          <VStack gap={2} textAlign="center" w="100%">
            <Box
              w={{ base: 10, md: 12 }}
              h={{ base: 10, md: 12 }}
              borderRadius="full"
              bgGradient="linear(to-r, blue.500, purple.500)"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Heading size={{ base: "sm", md: "md" }} color="white">
                FYC
              </Heading>
            </Box>
            <Heading size={{ base: "md", md: "lg" }} color="white">
              The Spanish Timbrado Club
            </Heading>
            <Text color="whiteAlpha.800" fontSize={{ base: "xs", md: "sm" }}>
              Spanish Timbrado breeding & management system
            </Text>
          </VStack>

          {/* Login Card */}
          <Box
            w="100%"
            p={{ base: 6, md: 8 }}
            borderRadius="2xl"
            boxShadow="0 20px 60px rgba(0,0,0,0.3)"
            bg="white"
            transition="all 0.3s"
            _hover={{ boxShadow: "0 25px 70px rgba(0,0,0,0.35)" }}
          >
            <VStack gap={{ base: 4, md: 6 }} w="100%">
              {/* Error Alert */}
              {error && (
                <Alert
                  status="error"
                  borderRadius="lg"
                  bg="red.50"
                  borderLeft="4px solid"
                  borderColor="red.500"
                >
                  <Text color="red.700" fontSize={{ base: "xs", md: "sm" }}>
                    {error}
                  </Text>
                </Alert>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                <Stack gap={{ base: 4, md: 5 }}>
                  {/* Username/Email Field */}
                  <FormControl isRequired>
                    <FormLabel fontSize={{ base: "xs", md: "sm" }} fontWeight="600" color="gray.700">
                      Username or Email
                    </FormLabel>
                    <HStack
                      borderRadius="lg"
                      border="2px solid"
                      borderColor="gray.200"
                      px={{ base: 2, md: 3 }}
                      py={{ base: 2, md: 2 }}
                      transition="all 0.2s"
                      _focusWithin={{
                        borderColor: "blue.500",
                        boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.1)",
                      }}
                    >
                      <Icon as={FiMail} color="gray.400" boxSize={{ base: 4, md: 5 }} />
                      <Input
                        type="text"
                        value={usernameOrEmail}
                        onChange={(e) => setUsernameOrEmail(e.target.value)}
                        placeholder="Enter your username or email"
                        border="none"
                        _focus={{ outline: "none" }}
                        fontSize={{ base: "sm", md: "sm" }}
                      />
                    </HStack>
                  </FormControl>

                  {/* Password Field */}
                  <FormControl isRequired>
                    <FormLabel fontSize={{ base: "xs", md: "sm" }} fontWeight="600" color="gray.700">
                      Password
                    </FormLabel>
                    <HStack
                      borderRadius="lg"
                      border="2px solid"
                      borderColor="gray.200"
                      px={{ base: 2, md: 3 }}
                      py={{ base: 2, md: 2 }}
                      transition="all 0.2s"
                      _focusWithin={{
                        borderColor: "blue.500",
                        boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.1)",
                      }}
                    >
                      <Icon as={FiLock} color="gray.400" boxSize={{ base: 4, md: 5 }} />
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        border="none"
                        _focus={{ outline: "none" }}
                        fontSize={{ base: "sm", md: "sm" }}
                      />
                    </HStack>
                  </FormControl>

                  {/* Remember Me Checkbox */}
                  <HStack justify="space-between" w="100%" flexWrap={{ base: "wrap", md: "nowrap" }} gap={{ base: 2, md: 0 }}>
                    <Checkbox
                      isChecked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      colorScheme="blue"
                      size={{ base: "sm", md: "md" }}
                    >
                      <Text fontSize={{ base: "xs", md: "sm" }} color="gray.700">
                        Remember me
                      </Text>
                    </Checkbox>
                    <Link
                      href="/forgot-password"
                      fontSize={{ base: "xs", md: "sm" }}
                      color="blue.600"
                      _hover={{ color: "blue.700", textDecoration: "underline" }}
                    >
                      Forgot password?
                    </Link>
                  </HStack>

                  {/* Login Button */}
                  <Button
                    type="submit"
                    colorScheme="blue"
                    disabled={loading}
                    w="100%"
                    h={{ base: 10, md: 12 }}
                    fontSize={{ base: "sm", md: "sm" }}
                    fontWeight="600"
                    bgGradient="linear(to-r, blue.500, blue.600)"
                    _hover={{
                      bgGradient: "linear(to-r, blue.600, blue.700)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 10px 25px rgba(66, 153, 225, 0.3)",
                    }}
                    _active={{ transform: "translateY(0)" }}
                    transition="all 0.2s"
                  >
                    {loading ? "Logging in..." : (
                      <HStack gap={2}>
                        <Text>Sign In</Text>
                        <FiArrowRight />
                      </HStack>
                    )}
                  </Button>
                </Stack>
              </form>

              {/* Divider */}
              <HStack w="100%" gap={3}>
                <Divider borderColor="gray.200" />
                <Text fontSize={{ base: "xs", md: "xs" }} color="gray.500" whiteSpace="nowrap">
                  New here?
                </Text>
                <Divider borderColor="gray.200" />
              </HStack>

              {/* Register Link */}
              <VStack gap={2} w="100%">
                <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" textAlign="center">
                  Don't have an account?
                </Text>
                <Link
                  href="/signup"
                  w="100%"
                >
                  <Button
                    w="100%"
                    variant="outline"
                    colorScheme="blue"
                    h={{ base: 9, md: 10 }}
                    fontSize={{ base: "sm", md: "sm" }}
                    fontWeight="600"
                    borderColor="blue.500"
                    color="blue.600"
                    _hover={{
                      bg: "blue.50",
                      transform: "translateY(-1px)",
                    }}
                    transition="all 0.2s"
                  >
                    Create Account
                  </Button>
                </Link>
              </VStack>
            </VStack>
          </Box>

          {/* Footer */}
          <Text fontSize={{ base: "xs", md: "xs" }} color="whiteAlpha.700" textAlign="center">
            © 2025 Spanish Timbrado Young Club. All rights reserved.
          </Text>
        </VStack>
      </Container>
    </Flex>
  );
}

