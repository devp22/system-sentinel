import React from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Box,
  Grid,
  IconButton,
  Fade,
  Slide,
} from "@mui/material";
import { styled } from "@mui/system";
import "./LandingPage.css";

const Logo = styled("img")({
  height: "200px",
  transition: "transform 0.3s",
  "&:hover": {
    transform: "scale(1.1)",
  },
});

const ScreenshotImage = styled("img")({
  width: "50%",
  borderRadius: "15px",
  border: "3px solid #444",
  transition: "transform 0.3s, box-shadow 0.3s",  // Ensure transition here for hover effect
  animation: "fadeInUp 1s ease-in-out",  // Add animation class
  "&:hover": {
    transform: "scale(1.05)",  // Hover scale effect
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",  // Box shadow effect on hover
  },
});

const AboutImage = styled("img")({
  width: "100%",
  maxHeight: "300px",
  borderRadius: "8px",
  transition: "transform 0.3s, box-shadow 0.3s",
  animation: "fadeInUp 1s ease-in-out",  // Add animation class
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
  },
});

const FooterImage = styled("img")({
  height: "40px",
  margin: "0 10px",
});

function LandingPage() {
  return (
    <Box className="landing-page">
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="logo">
            <Logo src={require("./images/simplimed-logo.png")} alt="Logo" />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="contained" color="primary" className="start-button">
            Get Started
          </Button>
        </Toolbar>
      </AppBar>

      <Fade in timeout={1000}>
        <Box textAlign="center" my={5}>
          <Typography
            variant="h3"
            color="primary"
            fontWeight="bolder"
            component="h1"
            gutterBottom
          >
            Medical Reports Made Easy
          </Typography>
        </Box>
      </Fade>

      <Grid container spacing={4} justifyContent="center" className="screenshots">
        {[1, 2].map((img, index) => (
          <Grid item xs={12} key={index}>
            <Slide direction="up" in timeout={500 + index * 500}>
              <ScreenshotImage
                src={require(`./images/ss${img}.png`)}
                alt={`Screenshot ${img}`}
                className="screenshot-image"
              />
            </Slide>
          </Grid>
        ))}
      </Grid>

      <Box my={5} className="about">
        <Grid container spacing={6} alignItems="center" justifyContent="center">
          <Grid item xs={12} sm={6} md={5}>
            <Typography variant="h4" component="h2" gutterBottom align="center" className="about-title" fontWeight="bolder">
              Learn More About Your Medical Reports
            </Typography>
            <Typography variant="body1" align="justify" className="about-description">
              SimpliMed, an AI-driven platform aimed at simplifying and translating medical reports, leverages advanced technologies such as GPT-based language models, OCR, and AI voice assistants to bridge the communication gap in healthcare, empowering patients to understand their medical information better.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AboutImage src={require("./images/medical-report.jpg")} alt="About Image" className="about-image" />
          </Grid>
        </Grid>
      </Box>

      <Box my={5} className="manage-reports">
        <Grid container spacing={6} alignItems="center" justifyContent="center">
          <Grid item xs={12} sm={6} md={5}>
            <Typography variant="h4" fontWeight="bolder" component="h2" gutterBottom align="center">
              Manage Your Reports with a Personal Account
            </Typography>
            <Typography variant="body1" align="justify">
              Streamline your access to medical reports through a secure Auth0 login, backed by AWS for dependable data management. Enjoy secure, user-friendly entry to all your essential information in one place.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AboutImage src={require("./images/login.jpg")} alt="Login Image" />
          </Grid>
        </Grid>
      </Box>

      <Box textAlign="center" my={5} className="youtube-video">
        <Typography variant="h4" fontWeight="bolder" component="h2" gutterBottom>
          How to Use?
        </Typography>
        <Box height={50} />
        <iframe
          width="40%"
          height="315"
          src="https://www.youtube.com/embed/rseZEpnNCaU?si=hvpY9ac10lGnWbFA"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </Box>

      <Box textAlign="center" my={5}>
        <Typography variant="h6" component="h2" className="made-with-title">
          Made with
        </Typography>

        <Box mt={2} className="made-with-content">
          {["react", "flask", "aws", "openai", "auth0", "docker"].map((logo, index) => (
            <FooterImage
              key={index}
              src={require(`./images/${logo}-logo.png`)}
              alt={`${logo.charAt(0).toUpperCase() + logo.slice(1)} Logo`}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default LandingPage;
