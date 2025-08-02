import React from 'react';
import {
  VStack,
  Text,
  Button,
  Box,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';


type InstructionsProps = {
  onNext: () => void;
};

const Instructions: React.FC<InstructionsProps> = ({ onNext }) => (
  <VStack spacing={6} align="stretch" maxW="800px" mx="auto" p={6}>
    <Text fontSize="2xl" fontWeight="bold" textAlign="center">
      Instructions
    </Text>
    
    <Box bg="teal.50" p={6} borderRadius="lg" border="1px" borderColor="teal.200">
      <Text fontSize="lg" mb={4}>
        You will complete three subtests: <Text as="span" fontWeight="bold" color="teal.700">Digit Span Forward</Text>, <Text as="span" fontWeight="bold" color="teal.700">Backward</Text>, and <Text as="span" fontWeight="bold" color="teal.700">Sequencing</Text>.
      </Text>
      
      <Text fontSize="md" mb={4}>
        For each, you will hear a sequence of digits spoken aloud, one per second. After each sequence, repeat the digits back <Text as="span" fontWeight="bold">verbally</Text> in the correct order.
      </Text>
      
      <List spacing={3}>
        <ListItem>
          <Text><Text as="span" fontWeight="bold" color="teal.700">Forward:</Text> Repeat the digits in the same order.</Text>
        </ListItem>
        <ListItem>
          <Text><Text as="span" fontWeight="bold" color="teal.700">Backward:</Text> Repeat the digits in reverse order.</Text>
        </ListItem>
        <ListItem>
          <Text><Text as="span" fontWeight="bold" color="teal.700">Sequencing:</Text> Repeat the digits in ascending order.</Text>
        </ListItem>
      </List>
      
      <Text fontSize="md" mt={4} color="teal.700">
        The test will automatically progress. Please allow microphone access when prompted.
      </Text>
    </Box>
    
    <Button 
      colorScheme="teal" 
      size="lg" 
      onClick={onNext}
      alignSelf="center"
    >
      Start Test
    </Button>
  </VStack>
);

export default Instructions;
