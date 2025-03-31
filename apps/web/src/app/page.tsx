import { Badge } from "@repo/ui/components/base/badge";
import { Button } from "@repo/ui/components/base/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/base/accordion";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@repo/ui/components/base/alert";
import { Input } from "@repo/ui/components/base/input";
import { Label } from "@repo/ui/components/base/label";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/base/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
} from "@repo/ui/components/base/breadcrumb";
import { Calendar } from "@repo/ui/components/base/calendar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@repo/ui/components/base/card";
import { Carousel, CarouselItem } from "@repo/ui/components/base/carousel";
import { Checkbox } from "@repo/ui/components/base/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/base/collapsible";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
} from "@repo/ui/components/base/command";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@repo/ui/components/base/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/base/dialog";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@repo/ui/components/base/drawer";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/base/dropdown-menu";

export default function Home() {
  return (
    <div className="overflow-y-auto">
      <div className="flex flex-col items-center justify-center h-full gap-4 py-12 mt-10 max-w-screen-lg mx-auto">
        <Button>Click me</Button>
        <Badge variant="destructive">Badge</Badge>
        <Accordion type="single" defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>Accordion Item 1</AccordionTrigger>
            <AccordionContent>
              <p>Accordion Item 1 content</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Accordion Item 2</AccordionTrigger>
            <AccordionContent>
              <p>Accordion Item 2 content</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Alert>
          <AlertTitle>Alert</AlertTitle>
          <AlertDescription>Alert Description</AlertDescription>
        </Alert>
        <Button variant="outline">Button</Button>
        <Input />
        <Label>Label</Label>
        <Avatar className="h-20 w-20 hover:shadow-lg transition-all duration-300">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <Breadcrumb>
          <BreadcrumbItem>Home</BreadcrumbItem>
          <BreadcrumbItem>Dashboard</BreadcrumbItem>
          <BreadcrumbItem>Settings</BreadcrumbItem>
        </Breadcrumb>
        <Calendar />
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
        </Card>

        <Carousel>
          <CarouselItem>
            <img
              src="https://placehold.co/600x400"
              alt="Carousel Item 1"
              width={600}
              height={400}
            />
          </CarouselItem>
          <CarouselItem>
            <img
              src="https://placehold.co/600x400"
              alt="Carousel Item 2"
              width={600}
              height={400}
            />
          </CarouselItem>
        </Carousel>

        <Checkbox />

        <Collapsible>
          <CollapsibleTrigger>Collapsible</CollapsibleTrigger>
          <CollapsibleContent>Collapsible Content</CollapsibleContent>
        </Collapsible>

        <Command>
          <CommandGroup>
            <CommandInput />
            <CommandList>
              <CommandItem>Command Item</CommandItem>
            </CommandList>
          </CommandGroup>
        </Command>

        <ContextMenu>
          <ContextMenuTrigger>ContextMenu</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Context Menu Item</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        <Dialog>
          <DialogTrigger>Dialog</DialogTrigger>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>Dialog Description</DialogDescription>
            </DialogHeader>
            Dialog Content
          </DialogContent>
        </Dialog>

        <Drawer>
          <DrawerTrigger>Drawer</DrawerTrigger>
          <DrawerContent className="max-w-md bg-white">
            <DrawerHeader>
              <DrawerTitle>Drawer Title</DrawerTitle>
              <DrawerDescription>Drawer Description</DrawerDescription>
            </DrawerHeader>
            Drawer Content
          </DrawerContent>
        </Drawer>

        <DropdownMenu>
          <DropdownMenuTrigger>DropdownMenu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Dropdown Menu Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
