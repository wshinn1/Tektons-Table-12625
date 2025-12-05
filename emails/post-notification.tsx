import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface PostNotificationEmailProps {
  tenantName: string;
  tenantSubdomain: string;
  postTitle: string;
  postExcerpt: string;
  postUrl: string;
  donateUrl: string;
  unsubscribeUrl: string;
  language?: string;
}

export const PostNotificationEmail = ({
  tenantName,
  tenantSubdomain,
  postTitle,
  postExcerpt,
  postUrl,
  donateUrl,
  unsubscribeUrl,
  language = 'en',
}: PostNotificationEmailProps) => {
  const translations = {
    en: {
      preview: `${tenantName} shared a new update`,
      greeting: `New update from ${tenantName}`,
      readMore: 'Read Full Update',
      donate: 'Support This Mission',
      unsubscribe: 'Unsubscribe from these emails',
    },
    es: {
      preview: `${tenantName} compartió una nueva actualización`,
      greeting: `Nueva actualización de ${tenantName}`,
      readMore: 'Leer actualización completa',
      donate: 'Apoyar esta misión',
      unsubscribe: 'Cancelar suscripción',
    },
    pt: {
      preview: `${tenantName} compartilhou uma nova atualização`,
      greeting: `Nova atualização de ${tenantName}`,
      readMore: 'Ler atualização completa',
      donate: 'Apoiar esta missão',
      unsubscribe: 'Cancelar inscrição',
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <Html>
      <Head />
      <Preview>{t.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{t.greeting}</Heading>
          <Heading style={h2}>{postTitle}</Heading>
          <Text style={text}>{postExcerpt}</Text>
          <Section style={buttonContainer}>
            <Button style={button} href={postUrl}>
              {t.readMore}
            </Button>
          </Section>
          <Hr style={hr} />
          <Section style={buttonContainer}>
            <Button style={donateButton} href={donateUrl}>
              {t.donate}
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            <Link href={unsubscribeUrl} style={link}>
              {t.unsubscribe}
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0 40px',
};

const h2 = {
  color: '#000',
  fontSize: '20px',
  fontWeight: '600',
  margin: '20px 0',
  padding: '0 40px',
};

const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
  padding: '0 40px',
};

const buttonContainer = {
  padding: '0 40px',
  margin: '24px 0',
};

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
};

const donateButton = {
  ...button,
  backgroundColor: '#10b981',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 40px',
  textAlign: 'center' as const,
};

const link = {
  color: '#5469d4',
  textDecoration: 'underline',
};

export default PostNotificationEmail;
