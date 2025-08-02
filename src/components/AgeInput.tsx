import React, { useState } from 'react';
import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Flex,
  Slider,
  SliderTrack,
  SliderThumb,
  SliderFilledTrack,
  Button,
  VStack,
  Text,
  Box,
} from '@chakra-ui/react'

type AgeInputProps = {
  onNext: (age: number) => void; //common function with named pro
};


const AgeInput: React.FC<AgeInputProps> = ({ onNext }) => {
  const [age, setAge] = useState(16);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (age < 16 || age > 89) {
      setError('Please enter a valid age between 16 and 89.');
      return;
    }
    setError('');
    onNext(age);
  };

  const handleChange = (value: number) => {
    setAge(value);
    setError('');
  };

  return (
    <VStack spacing={6} align="stretch" maxW="500px" mx="auto" p={6}>
     <Text fontSize="2xl" fontWeight="bold" textAlign="center">
        Welcome to the Digit Span Test
      </Text>
      
      <Text fontSize="lg" textAlign="center" color="teal.500">
        Please enter your age:
      </Text>
    <Flex> 
    <NumberInput 
    defaultValue={16}
    max={89}
    keepWithinRange={true}
    clampValueOnBlur={true}
    maxW={'100px'}
    mr={'2rem'}
    value={age}
    onChange={(value) => {handleChange(parseInt(value) || 16)}}
    >
      <NumberInputField />
      <NumberInputStepper>
        <NumberIncrementStepper />
        <NumberDecrementStepper />
      </NumberInputStepper>
    </NumberInput>
          <Slider
          flex='1'
          focusThumbOnChange={false}
          min={16}
          max={89}
          step={1}
          value={age}
          onChange={handleChange}
          colorScheme="teal"
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb fontSize='sm' boxSize='32px' children={age} />
                  </Slider>
        </Flex>

        {error && (
          <Text color="red.500" textAlign="center">
            {error}
          </Text>
        )}

        <Button 
          colorScheme="teal" 
          size="lg" 
          onClick={handleSubmit}
          isDisabled={age < 16 || age > 89}
        >
          Start Test
        </Button>
       </VStack>
  )
};

export default AgeInput;
