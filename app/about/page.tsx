"use client";

import {
  Box,
  Button,
  Container,
  Heading,
  Stack,
  Text,
  Flex,
  VStack,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { GiEagleHead } from "react-icons/gi";
import { FiLogIn } from "react-icons/fi";
import { FaChartLine, FaUsers, FaCog, FaAward } from "react-icons/fa";
import {Divider} from "@chakra-ui/layout";

interface InfoCardProps {
  icon: any;
  title: string;
  description: string;
}

const InfoCard = ({ icon, title, description }: InfoCardProps) => (
  <Box
    p={{ base: 4, md: 6 }}
    bg="white"
    borderRadius="lg"
    boxShadow="md"
    _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
    transition="all 0.3s"
  >
    <VStack gap={3} alignItems="start">
      <HStack gap={3}>
        <Box
          p={2}
          bg="blue.100"
          borderRadius="md"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={icon} w={6} h={6} color="blue.600" />
        </Box>
        <Heading size="md" color="gray.800">
          {title}
        </Heading>
      </HStack>
      <Text color="gray.600" fontSize="sm">
        {description}
      </Text>
    </VStack>
  </Box>
);

export default function AboutPage() {
  const router = useRouter();


  return (
    <Box bg="gray.50" minH="100vh">
      {/* Navigation Bar */}
      <Box bg="white" boxShadow="sm" position="sticky" top={0} zIndex={10}>
        <Container maxW="7xl" py={{ base: 3, md: 4 }} px={{ base: 4, md: 6 }}>
          <Flex justifyContent="space-between" alignItems="center">
            <HStack gap={{ base: 1, md: 2 }}>
              <Icon as={GiEagleHead} w={{ base: 6, md: 8 }} h={{ base: 6, md: 8 }} color="blue.600" />
              <Heading size={{ base: "md", md: "lg" }} color="blue.600" cursor="pointer" onClick={() => router.push("/")}
              >
                FYC
              </Heading>
            </HStack>
            <HStack gap={{ base: 2, md: 4 }}>
              <Button
                variant="ghost"
                size={{ base: "sm", md: "md" }}
                onClick={() => router.push("/")}
              >
                ← Back Home
              </Button>
              <Button
                colorScheme="blue"
                size="sm"
                onClick={() => router.push("/login")}
              >
                <FiLogIn style={{ marginRight: '8px' }} />
                Login
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" py={{ base: 12, md: 16 }} color="white">
        <Container maxW="7xl" px={{ base: 4, md: 6 }}>
          <VStack gap={{ base: 6, md: 8 }} textAlign="center">
            <Heading size={{ base: "xl", md: "2xl" }} fontWeight="bold">
              About the FYC Spanish Timbrado Club
            </Heading>
            <Text fontSize={{ base: "md", md: "lg" }} opacity={0.95}>
              Learn about our mission, history, and commitment to Spanish Timbrado breeding excellence
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="7xl" py={{ base: 12, md: 20 }} px={{ base: 4, md: 6 }}>
        <VStack gap={{ base: 10, md: 16 }} align="stretch">
          {/* Introduction Section */}
          <Box>
            <Heading size="lg" mb={4} color="gray.800">
              Welcome to the Spanish Timbrado Young Club
            </Heading>
            <Text color="gray.700" fontSize={{ base: "sm", md: "base" }} lineHeight="1.8">
              Founded in 2003, The FYC Spanish Timbrado Club is a dedicated community of passionate breeders committed to the preservation and advancement of the Spanish Timbrado canary breed. Our platform provides comprehensive tools and resources for managing breeding programs, tracking genetics, and connecting with fellow enthusiasts worldwide.
            </Text>
          </Box>

          <Divider />

          {/* Mission & Vision */}
          <Box>
            <VStack gap={6} align="stretch">
              <div>
                <HStack mb={3}>
                  <Box
                    p={2}
                    bg="blue.100"
                    borderRadius="md"
                  >
                    <Icon as={FaChartLine} w={6} h={6} color="blue.600" />
                  </Box>
                  <Heading size="md" color="gray.800">
                    Our Mission
                  </Heading>
                </HStack>
                <Text color="gray.700" fontSize={{ base: "sm", md: "base" }} lineHeight="1.8">
                  To empower Spanish Timbrado breeders with advanced management tools, educational resources, and a supportive community that promotes breed excellence, genetic diversity, and sustainable breeding practices.
                </Text>
              </div>

              <div>
                <HStack mb={3}>
                  <Box
                    p={2}
                    bg="green.100"
                    borderRadius="md"
                  >
                    <Icon as={FaAward} w={6} h={6} color="green.600" />
                  </Box>
                  <Heading size="md" color="gray.800">
                    Our Vision
                  </Heading>
                </HStack>
                <Text color="gray.700" fontSize={{ base: "sm", md: "base" }} lineHeight="1.8">
                  To be the leading global platform for Spanish Timbrado canary breeding management, fostering a thriving community where breeders can achieve excellence through innovation, collaboration, and best practices.
                </Text>
              </div>
            </VStack>
          </Box>

          <Divider />

          {/* What We Offer */}
          <Box>
            <Heading size="lg" mb={6} color="gray.800">
              What We Offer
            </Heading>
            <Stack gap={4} direction={{ base: "column", md: "column" }}>
              <InfoCard
                icon={FaAward}
                title="Breeding Management"
                description="Track your Spanish Timbrados with detailed profiles including genetics, breeding history, lineage, and performance records. Manage your breeding program efficiently with our intuitive tools."
              />
              <InfoCard
                icon={FaChartLine}
                title="Analytics & Insights"
                description="Gain valuable insights into your breeding program with comprehensive analytics, charts, and reports. Monitor genetic diversity, breeding success rates, and program progress."
              />
              <InfoCard
                icon={FaUsers}
                title="Community"
                description="Connect with breeders worldwide, share experiences, learn best practices, and collaborate on breed improvement initiatives. Build networks with other passionate Spanish Timbrado enthusiasts."
              />
              <InfoCard
                icon={FaCog}
                title="Customizable Tools"
                description="Tailor our platform to your specific needs. Create custom breeding plans, set goals, track milestones, and organize your program exactly how you want."
              />
            </Stack>
          </Box>

          <Divider />

          {/* Key Features */}
          <Box>
            <Heading size="lg" mb={6} color="gray.800">
              Key Features
            </Heading>
            <VStack gap={4} align="start">
              <Box>
                <Heading size="sm" mb={2} color="blue.600">
                  Genetic Management
                </Heading>
                <VStack gap={2} align="start" color="gray.700" fontSize={{ base: "sm", md: "base" }}>
                  <HStack align="start" gap={2}><Text>•</Text><Text>Track genetic lineage and breeding history</Text></HStack>
                  <HStack align="start" gap={2}><Text>•</Text><Text>Monitor genetic diversity in your program</Text></HStack>
                  <HStack align="start" gap={2}><Text>•</Text><Text>Identify potential health risks and advantages</Text></HStack>
                  <HStack align="start" gap={2}><Text>•</Text><Text>Plan optimal pairings based on genetics</Text></HStack>
                </VStack>
              </Box>

              <Box>
                <Heading size="sm" mb={2} color="blue.600">
                  Performance Tracking
                </Heading>
                <VStack gap={2} align="start" color="gray.700" fontSize={{ base: "sm", md: "base" }}>
                  <HStack align="start" gap={2}><Text>•</Text><Text>Record breeding results and success rates</Text></HStack>
                  <HStack align="start" gap={2}><Text>•</Text><Text>Track chick survival and development</Text></HStack>
                  <HStack align="start" gap={2}><Text>•</Text><Text>Document bird performance metrics</Text></HStack>
                  <HStack align="start" gap={2}><Text>•</Text><Text>Generate comprehensive breeding reports</Text></HStack>
                </VStack>
              </Box>

              <Box>
                <Heading size="sm" mb={2} color="blue.600">
                  Collaboration Tools
                </Heading>
                <VStack gap={2} align="start" color="gray.700" fontSize={{ base: "sm", md: "base" }}>
                  <HStack align="start" gap={2}><Text>•</Text><Text>Manage team members and roles</Text></HStack>
                  <HStack align="start" gap={2}><Text>•</Text><Text>Share breeding information securely</Text></HStack>
                  <HStack align="start" gap={2}><Text>•</Text><Text>Collaborate on breeding projects</Text></HStack>
                  <HStack align="start" gap={2}><Text>•</Text><Text>Set and track program goals together</Text></HStack>
                </VStack>
              </Box>
            </VStack>
          </Box>

          <Divider />

          {/* Why Choose Us */}
          <Box>
            <Heading size="lg" mb={6} color="gray.800">
              Why Choose the FYC Spanish Timbrado Club?
            </Heading>
            <VStack gap={4} align="start" color="gray.700" fontSize={{ base: "sm", md: "base" }}>
              <HStack align="start" gap={3}>
                <Box mt={1}>✓</Box>
                <Text><strong>Breed Expertise:</strong> Built by breeders, for breeders who understand the unique needs of Spanish Timbrado management</Text>
              </HStack>
              <HStack align="start" gap={3}>
                <Box mt={1}>✓</Box>
                <Text><strong>Comprehensive Tools:</strong> All-in-one platform for genetics, breeding, analytics, and team management</Text>
              </HStack>
              <HStack align="start" gap={3}>
                <Box mt={1}>✓</Box>
                <Text><strong>Data Security:</strong> Enterprise-grade security to protect your valuable breeding information</Text>
              </HStack>
              <HStack align="start" gap={3}>
                <Box mt={1}>✓</Box>
                <Text><strong>Global Community:</strong> Connect with Spanish Timbrado breeders from around the world</Text>
              </HStack>
              <HStack align="start" gap={3}>
                <Box mt={1}>✓</Box>
                <Text><strong>Continuous Innovation:</strong> Regular updates and new features based on community feedback</Text>
              </HStack>
              <HStack align="start" gap={3}>
                <Box mt={1}>✓</Box>
                <Text><strong>Educational Resources:</strong> Access breeding guides, best practices, and expert insights</Text>
              </HStack>
            </VStack>
          </Box>

          <Box borderTop="1px" borderColor="gray.300" />

          {/* Call to Action */}
          <Box textAlign="center">
            <VStack gap={4}>
              <Heading size="md" color="gray.800">
                Ready to Transform Your Breeding Program?
              </Heading>
              <Text color="gray.600" fontSize={{ base: "sm", md: "base" }}>
                Join hundreds of dedicated Spanish Timbrado breeders already using FYC to manage their programs
              </Text>
              <HStack gap={4} justify="center" flexWrap="wrap">
                <Button
                  colorScheme="blue"
                  size={{ base: "sm", md: "lg" }}
                  onClick={() => router.push("/signup")}
                >
                  Sign Up Now
                </Button>
                <Button
                  variant="outline"
                  colorScheme="blue"
                  size={{ base: "sm", md: "lg" }}
                  onClick={() => router.push("/login")}
                >
                  Sign In
                </Button>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </Container>

      {/* Footer */}
      <Box bg="gray.800" color="gray.200" py={{ base: 6, md: 8 }} mt={{ base: 8, md: 12 }}>
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

