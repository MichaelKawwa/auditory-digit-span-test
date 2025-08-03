import React, { useEffect, useState } from 'react';
import { VStack, Text, Button, Box } from '@chakra-ui/react';

// AdGate component displays a video ad and only allows the
// user to proceed to their results after the ad has played for
// a short period of time. Replace the data-ad-slot value with
// your own AdSense slot ID for a real advertisement.

type AdGateProps = {
  onComplete: () => void;
};

const AdGate: React.FC<AdGateProps> = ({ onComplete }) => {
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    // Initialize AdSense ad
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('Adsense error', err);
    }

    // Require the user to view the ad for at least 15 seconds
    const timer = setTimeout(() => setCanContinue(true), 15000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <VStack spacing={6} p={6} maxW="800px" mx="auto">
      <Text fontSize="lg" fontWeight="bold" textAlign="center" color="teal.700">
        Please watch this short ad to view your results
      </Text>

      <Box
        as="ins"
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-3280047684318351"
        data-ad-slot="1234567890"
        data-ad-format="video"
        data-full-width-responsive="true"
      />

      <Button
        colorScheme="teal"
        onClick={onComplete}
        isDisabled={!canContinue}
      >
        View Results
      </Button>
    </VStack>
  );
};

export default AdGate;

