
import siteConfig from '@/data/siteConfig.json';
import features from '@/data/features.json';
import testimonials from '@/data/testimonials.json';
import howItWorks from '@/data/howItWorks.json';
import cta from '@/data/cta.json';

// Type definitions for our JSON data
export interface SiteConfig {
  product_name: string;
  tagline: string;
  what_it_is: string;
}

export interface Feature {
  name: string;
  description: string;
  bullets: string[];
  cta: string;
  icon: string;
}

export interface FeaturesData {
  heading: string;
  subheading: string;
  features: Feature[];
}

export interface Testimonial {
  name: string;
  position: string;
  company: string;
  image: string;
  quote: string;
}

export interface TestimonialsData {
  heading: string;
  subheading: string;
  testimonials: Testimonial[];
}

export interface Step {
  number: string;
  title: string;
  description: string;
  image: string;
}

export interface HowItWorksData {
  heading: string;
  subheading: string;
  steps: Step[];
}

export interface CTAData {
  headline: string;
  subheading: string;
  primary_cta: string;
  secondary_cta: string;
  note: string;
}

// Functions to get the data
export const getSiteConfig = (): SiteConfig => siteConfig;
export const getFeaturesData = (): FeaturesData => features;
export const getTestimonialsData = (): TestimonialsData => testimonials;
export const getHowItWorksData = (): HowItWorksData => howItWorks;
export const getCTAData = (): CTAData => cta;
