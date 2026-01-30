import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  useCdn: true,
  apiVersion: "2024-01-01",
  perspective: "published",
});

export const previewClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  useCdn: false,
  apiVersion: "2024-01-01",
  token: import.meta.env.VITE_SANITY_READ_TOKEN,
  perspective: "previewDrafts",
});

const builder = createImageUrlBuilder(client);

export function getClient(preview = false) {
  return preview ? previewClient : client;
}

export function urlFor(source) {
  return builder.image(source);
}

export async function getHero() {
  return await client.fetch(`*[_type == "hero" && pageId == "home"][0]{
    _id,
    title_en,
    title_sv,
    subtitle_en,
    subtitle_sv,
    image{
      asset->{
        url
      }
    }
  }`);
}

export async function getAboutHero() {
  return await client.fetch(`*[_type == "hero" && pageId == "about"][0]{
    _id,
    title_en,
    title_sv,
    subtitle_en,
    subtitle_sv,
    image{
      asset->{
        url
      }
    }
  }`);
}

export async function getAboutMission() {
  return await client.fetch(`*[_type == 'aboutMission'][0]{
    _id,
    title_sv,
    title_en,
    description_sv,
    description_en
  }`);
}

export async function getAboutStats() {
  return await client.fetch(`*[_type == 'aboutStats'][0]{
    _id,
    stats[]{
      number,
      label_sv,
      label_en
    }
  }`);
}

export async function getAboutStory() {
  return await client.fetch(`*[_type == "aboutStory"][0]{
    _id,
    title_sv,
    title_en,
    subheading_sv,
    subheading_en,
    content_sv,
    content_en,
    image{
      asset->{
        url
      },
      alt
    }
  }`);
}

export async function getTeam() {
  return await client.fetch(`*[_type == 'team']{
    _id,
    firstName,
    surname,
    initials,
    role,
    description_sv,
    description_en
  }`);
}

export async function getTeamSection() {
  return await client.fetch(`*[_type == "teamSection"][0]{
    _id,
    title_sv,
    title_en
  }`);
}

export async function getEvents(preview = false) {
  const activeClient = getClient(preview);

  return await activeClient.fetch(`*[_type == 'event']{
    _id,
    title,
    slug,
    image{
      asset->{
        url
      },
      alt
    },
    eventDateTime,
    location,
    category->{
      title
    },
    maxParticipants,
    description,
    price
  }`);
}

export async function getCategories() {
  return await client.fetch(`*[_type == "category"]{
    _id,
    title,
    slug
  }`);
}

export async function getUpcomingEvents(limit = 3, preview = false) {
  const activeClient = getClient(preview);

  return await activeClient.fetch(`*[_type == "event" && eventDateTime > now()] | order(eventDateTime asc) [0...${limit}]{
    _id,
    title,
    slug,
    image{
      asset->{
        url
      }
    },
    eventDateTime,
    location,
    category->{
      title,
      slug
    },
    price,
    maxParticipants,
    description,
    whatToBring,
    hostName,
    hostBio,
    hostAvatar
  }`);
}

export async function getEventsSpots(slug, preview = false) {
  const activeClient = getClient(preview);

  return await activeClient.fetch(
    `*[_type == "event" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    image{
      asset->{
        url
      }
    },
    eventDateTime,
    location,
    category->{
      title,
      slug
    },
    price,
    maxParticipants,
    description,
    whatToBring,
    hostName,
    hostBio,
    hostAvatar
  }`,
    { slug }
  );
}

export async function getValue() {
  return await client.fetch(`*[_type == 'value']{
  _id,
  title_sv,
  title_en,
    description_sv,
    description_en,
    icon
  }`);
}

export async function getEventDetails(preview = false) {
  const activeClient = getClient(preview);

  return await activeClient.fetch(`*[_type == 'event']{
    _id,
    title,
    image,
    slug,
    eventDateTime,
    location,
    category->{
      title,
      slug
    },
    price,
    maxParticipants,
    description,
    whatToBring,
    description,
    hostName,
    hostBio,
    hostAvatar
  }`);
}

export async function getHostEventCTA() {
  return await client.fetch(`*[_type == "cta" && pageId == "host-event"][0]{
    _id,
    title_en,
    title_sv,
    subtitle_en,
    subtitle_sv,
    buttonText_en,
    buttonText_sv
  }`);
}

export async function getJoinCommunityCTA() {
  return await client.fetch(`*[_type == "cta" && pageId == "join-community"][0]{
    _id,
    title_en,
    title_sv,
    subtitle_en,
    subtitle_sv,
    buttonText_en,
    buttonText_sv
  }`);
}

export async function getHowItWorks() {
  return await client.fetch(`*[_type == "howItWorks"] | order(order asc){
    _id,
    title_en,
    title_sv,
    description_en,
    description_sv,
    order,
    icon{
      asset->{
        url
      }
    }
  }`);
}
