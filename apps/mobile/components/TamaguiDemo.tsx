import React, { useState } from "react";
import { Button, Card, H2, Paragraph, View, Input } from "tamagui";

export function TamaguiDemo() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");

  return (
    <Card
      bordered
      elevate
      size="$4"
      animation="bouncy"
      width="100%"
      scale={0.9}
      hoverStyle={{ scale: 0.925 }}
      pressStyle={{ scale: 0.875 }}
      theme="active"
    >
      <Card.Header padded>
        <H2>Tamagui Demo</H2>
        <Paragraph>Count: {count}</Paragraph>
      </Card.Header>

      <Card.Footer padded>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
            gap: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Input
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              width="100%"
            />
          </View>
          <View style={{ width: 12 }} />
          <Button theme="blue" onPress={() => setCount((prev) => prev + 1)}>
            Increment
          </Button>
        </View>

        <View style={{ marginTop: 20 }}>
          {name ? <Paragraph>Hello, {name}!</Paragraph> : null}
        </View>
      </Card.Footer>
    </Card>
  );
}
