    /* eslint-disable react/prop-types */
    /* eslint-disable react/display-name */
    import React, { useState, useEffect, useRef, useCallback } from "react";
    import { Helmet } from "react-helmet";
    import {
      Box,
      Input,
      VStack,
      Text,
      IconButton,
      useDisclosure,
      Collapse,
      Button,
    } from "@chakra-ui/react";

    import {
      RingLoader,
      ClipLoader,
  
    } from "react-spinners";
  
    import { motion } from "framer-motion";
    import ModalImage from "react-modal-image"; 
    import { useParams } from 'react-router-dom';
    import { FaArrowCircleUp, FaBars, FaTimes } from "react-icons/fa";
    import { useNavigate, useLocation } from "react-router-dom";
    import ReactPlayer from "react-player";
    import "../styles/Blogs.css";
    import { Link } from "react-router-dom";
    const slugify = (text) => {
      return text.toString().toLowerCase()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^\w-]+/g, '')     // Remove all non-word characters
        .replace(/--+/g, '-')        // Replace multiple - with single -
        .replace(/^-+/, '')          // Trim - from start of text
        .replace(/-+$/, '');         // Trim - from end of text
    };
    
    const BlogTitle = React.forwardRef(({ title, collection,onClick, location }, ref) => {
      const slug = slugify(title); // Generate slug from title
    
      return (
        <motion.div
          whileHover={{
            textDecoration: "underline",
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={() => onClick(title, collection)}
          ref={ref}
          style={{ cursor: "pointer", marginLeft: location === "main" ? "50px" : "0", position: "relative" }} // Add position relative
        >
          <div
            style={{
              fontWeight: "bold",
              textDecoration: "none",
              fontFamily: "Roboto, sans-serif",
              textAlign: "left",
              padding: "8px",
              fontSize: location === "main" ? "25px" : "18px",
              color: location === "main" ? "white" : "Turquoise ",
              marginTop: location === "main" ? "50px" : "5px",
            }}
          >
            <Link
              to={`/${collection}/${slug}`} 
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {title}
            </Link>
          </div>
          {location === "main" && (
            <div
              style={{
                position: "absolute",
                bottom: "-5px",
                left: 0,
                width: "100%",
                height: "2px",
                background: "linear-gradient(to right, rgba(255, 215, 0, 1), rgba(255, 255, 255, 0.7), rgba(255, 215, 0, 1))", // Use linear gradient for a more dynamic shine effect
                borderRadius: "10px",
                animation: "shine 2s infinite linear",
              }}
            />
          )}
        </motion.div>
      );
    });
  
    const CourseDetails = () => {
      const [blogsData, setBlogsData] = useState({
       
      });
 
    
      
      
      
      const [loading, setLoading] = useState(true);
      const { category } = useParams();
      const [currentPage, setCurrentPage] = useState(1);
      const [postsPerPage] = useState(1); 
      const navigate = useNavigate();
      const titleRefs = useRef({});
      const { isOpen, onToggle } = useDisclosure();
      const [lastVisitedBlog, setLastVisitedBlog] = useState(null);
      const observer = useRef();
      const [searchQuery, setSearchQuery] = useState("");
      const [scrollProgress, setScrollProgress] = useState(0);
      const [remainingProgress, setRemainingProgress] = useState(100);
      const location = useLocation();
      const [clickedTitle, setClickedTitle] = useState(null);
      const handleSearchChange = (event) => {
        const newQuery = event.target.value;
        setSearchQuery(newQuery);
        navigate(`/${category}/search/${encodeURIComponent(newQuery)}`);
      };
      const fetchDataForCategory = async (category) => {
        try {
          const response = await fetch(`https://eduxcel-api-13march.onrender.com/api/${category}`);
          const responseData = await response.json();
          setBlogsData((prevData) => ({
            ...prevData,
            [category]: responseData,
          }));
        } catch (error) {
          console.error(`Error fetching ${category} data:`, error);
        }
      };
      
      useEffect(() => {
        if (category) {
          fetchDataForCategory(category).then(() => setLoading(false));
        } else {
          fetchDataForAllCollections().then(() => setLoading(false));
        }
      }, [category]);
      const fetchDataForAllCollections = async () => {
        const collections = ["data_science_courses", "machine_learning_courses"];
        const promises = collections.map((collection) => fetchData(collection));
        await Promise.all(promises);
      };
      const filteredBlogs = (category) => {
        const blogsCollection = blogsData[category] || [];
        return blogsCollection.filter((blog) => {
          // Check if blog.title is a string before calling toLowerCase()
          if (typeof blog.title === 'string') {
            return blog.title.toLowerCase().includes(searchQuery.toLowerCase());
          } else {
            return false; // Exclude the blog if title is not a string
          }
        });
      };                  
    useEffect(() => {
  fetchDataForAllCollections().then(() => setLoading(false));
}, []);
      const observeLastBlog = useCallback(
        (collection, node) => {
          if (observer.current) {
            observer.current.disconnect();
          }

          observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
              // Implement your logic here if needed
            }
          });
    
          if (node) {
            observer.current.observe(node);
          }
        },
        [observer]
      );
    
      const handleScroll = (e) => {
        const container = e.target;
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;

        const contentHeight = scrollHeight - clientHeight;
        const progress = (scrollTop / contentHeight) * 100;

        setScrollProgress(progress);

        const remaining = 100 - progress;
        setRemainingProgress(remaining);
      };

      const scrollToTop = () => {
        const container = document.getElementById("blogs-section");
        if (container) {
          container.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
      };
       
      const generateSlug = (text) => {
        return text.toString().toLowerCase()
          .replace(/\s+/g, '-')        // Replace spaces with -
          .replace(/[^\w-]+/g, '')     // Remove all non-word characters
          .replace(/--+/g, '-')        // Replace multiple - with single -
          .replace(/^-+/, '')          // Trim - from start of text
          .replace(/-+$/, '');         // Trim - from end of text
      };
    
      const handleTitleClick = useCallback((title, collection) => {
          const encodedTitle = encodeURIComponent(title);
          const matchingBlog = blogsData[collection].find((blog) => blog.title === title);
      
          if (matchingBlog) {
            const pageIndex =
              Math.ceil(blogsData[collection].indexOf(matchingBlog) / postsPerPage) + 1;
      
            const slug = generateSlug(title); // Generate slug from title
      
            navigate(`/${category}/${slug}`, {
              replace: true,
            });
      
            setCurrentPage(pageIndex);
      
            // Set the title dynamically when a title is clicked
            document.title = `${matchingBlog.title} | Eduxcel`; 
          }
          setLastVisitedBlog({ title, collection });
        }, [blogsData, navigate, postsPerPage, setCurrentPage, setLastVisitedBlog]);
      

      useEffect(() => {
        const query = location.pathname.split("/${category}/search/")[1] || "";
        setSearchQuery(decodeURIComponent(query));
        fetchDataForAllCollections();
    
        if (clickedTitle) {
          // Reset the clicked title state
          setClickedTitle(null);
        }
    
        // Check for title in URL and display the content directly
        const urlTitleMatch = location.pathname.match(/\/(.+?)\/(.+)/);
        if (urlTitleMatch) {
          const [, collection, encodedTitle] = urlTitleMatch;
          const urlTitle = decodeURIComponent(encodedTitle);
          const matchingBlog = blogsData[collection]?.find(
            (blog) =>
                slugify(blog.title) === urlTitle ||
          (blog.parentTitle && blog.parentTitle.title === urlTitle) ||
          
          (blog.content && blog.content.title === urlTitle) ||

          // Add more checks for other extensions as needed
          // ...
          false
      );
          if (matchingBlog) {
            // Set the current page to the matched blog's page
            const pageIndex =
              Math.ceil(blogsData[collection].indexOf(matchingBlog) / postsPerPage) + 1;
            setCurrentPage(pageIndex);
          // Set the title dynamically for SEO
      const pageTitle = `${matchingBlog.title} | EduXcel | Sanjay Patidar`;

      // Update Helmet to set the dynamically generated title
      const helmet = document.querySelector('title');
      if (helmet) {
        helmet.innerText = pageTitle;
      }
          }
        }
        if (lastVisitedBlog) {
          localStorage.setItem('lastVisitedBlog', JSON.stringify(lastVisitedBlog));
        }
      }, [blogsData, fetchDataForAllCollections, location, postsPerPage, setCurrentPage]);
    
      const indexOfLastPost = currentPage * postsPerPage;
      const indexOfFirstPost = indexOfLastPost - postsPerPage;
      const currentPosts = filteredBlogs(category).slice(indexOfFirstPost, indexOfLastPost);
      useEffect(() => {
        if (currentPosts.length > 0) {
          const pageTitle = `${currentPosts[0].title} | EduXcel | Sanjay Patidar`;
          document.title = pageTitle;
        }
      }, [currentPosts]);
    const headerStyle = {
      position: "sticky",
      top:0,
      zIndex: 1,
      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
      padding: "1rem",
      backdropFilter: "blur(10px)",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      borderRadius: "0 0 20px 20px", // Adds rounded corners at the bottom
      color: "#fff", // Text color
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontFamily: "Poppins, sans-serif", // Modern sans-serif font
    };
      const progressBarStyle = {
        width: `${scrollProgress}%`,
        height: "4px",
        backgroundColor: "green",
        borderRadius: "2px",
        transition: "width 0.3s",
      };

      const remainingBarStyle = {
        width: `${remainingProgress}%`,
        height: "4px",
        backgroundColor: "lightgray",
        borderRadius: "2px",
      };

      const scrollToTopButtonStyle = {
        position: "fixed",
        bottom: "30px",
        right: "1px",
        zIndex: 2,
        background: "green",
        color: "white",
        borderRadius: "50%",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
        padding: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "background-color 0.3s",
        fontSize: "24px",
      };

      const contentSectionStyle = {
        borderRadius: "12px",
                marginLeft: "50px",

       justifyContent:"start",
       alignItems:"start",
      };
      const sidebarStyle = {
        position: "fixed",
        top: "70px",
        left: 0,
        height: "100%",
        width: "200px",
        backgroundColor: "black",
        borderRight: "1px solid lightgray",
        padding: "0px",
        zIndex: 2,
        transition: "left 0.3s",
        overflowX: "hidden",
        overflowY: "auto", 
  maxHeight: "calc(100% - 50px)", 
      };
      const toggleButtonStyle = {
        position: "fixed",
        top: "170px",
        transform: "translateY(-50%)",
        left: isOpen ? "240px" : "20px",
        zIndex: 2,
        background: isOpen ? "#e74c3c" : "#2ecc71", // Red when open, green when closed
        color: "white",
        borderRadius: "50%",
        boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.3)",
        padding: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "left 0.3s, background 0.3s",
        border: "2px solid #fff", // White border
        fontSize: "12px",
      };
      const renderMediaContent = (content, title) => {
        if (!content) {
          return null;
        }
      
        if (!Array.isArray(content)) {
          // If content is not an array, wrap it in an array to handle it uniformly
          content = [content];
        }
      
        return content.map((item, index) => {
          if (Array.isArray(item)) {
            return (
              <VStack key={index} align="start" spacing={2} mt={2}>
                {renderMediaContent(item, title)}
              </VStack>
            );
          }
      
          let element;
      
          if (typeof item === "object" && item.title) {
            // Display object field titles on the same page as the parent title
            element = (
              <VStack key={index} align="start" spacing={2} mt={2}>
                <BlogTitle
                  title={item.title}
                  collection={category}
                  onClick={() => handleTitleClick(item.title, category)}
                />
                {renderMediaContent(item.description, title)}
                {renderMediaContent(item.installation, title)}
                {renderMediaContent(item.content, title)}
      
             </VStack>
            );
          }
      
          if (typeof item === "string") {
            // Handle special characters
            const specialCharsRegex = /[*$~]([^*$~]+)[*$~]/;
const matchSpecialChars = item.match(specialCharsRegex);

if (matchSpecialChars) {
  const specialText = matchSpecialChars[1];
  const textBeforeSpecial = item.split(matchSpecialChars[0])[0];
  const textAfterSpecial = item.split(matchSpecialChars[0])[1];

  element = (
    <Text key={index}>
      {textBeforeSpecial}
      <span
  style={{
    fontWeight: matchSpecialChars[0] === '*' ? 'bold' : 'normal',
    color: matchSpecialChars[0] === '$' ? 'green' : matchSpecialChars[0] === '~' ? 'lime' : 'gold',
    fontStyle: matchSpecialChars[0] === '*' ? 'italic' : 'normal',
    textDecoration: 'none',
    fontSize: matchSpecialChars[0] === '$' ? '1.2em' : matchSpecialChars[0] === '~' ? '1.1em' : '1em',
  }}
>

   {specialText}
      </span>
      {textAfterSpecial}
    </Text>
  );
} else {              // Check for links
              const linkRegex = /@([^@]+)@/;
              const match = item.match(linkRegex);
      
              if (match) {
                // Handle links
                const link = match[1];
                const textBeforeLink = item.split(match[0])[0];
                const textAfterLink = item.split(match[0])[1];
      
                element = (
                  <Text key={index}>
                    {textBeforeLink}
                    <span
                      style={{ color: "yellow", textDecoration: "underline", cursor: "pointer" }}
                      onClick={() => window.open(link, "_blank")}
                    >
                      {link}
                    </span>
                    {textAfterLink}
                  </Text>
                );
              } else if (item.startsWith("http")) {
                // Handle images and videos
                if (item.match(/\.(jpeg|jpg|gif|png)$/)) {
                  element = (
                    <Box key={index} mb={2} className="image-container">
                      <ModalImage
                        small={item}
                        large={item}
                        alt={`Image ${index}`}
                        className="custom-modal-image"
                      />
                    </Box>
                  );
                } else if (item.match(/\.(mp4|webm|mkv)$/)) {
                  element = (
                    <Box
                      key={index}
                      position="relative"
                      paddingTop="56.25%"
                      width="100%"
                    >
                      <ReactPlayer
                        url={item}
                        controls
                        width="100%"
                        height="100%"
                        style={{ position: "absolute", top: 0, left: 0 }}
                      />
                    </Box>
                  );
                } else {
                  element = <Text key={index}>{item}</Text>;
                }
              } else {
                // Handle regular text
                element = <Text key={index}>{item}</Text>;
              }
            }
          }
      
          return <Box key={index} mb={2}>{element}</Box>;
        });
      };

      const navbarHeight = document.querySelector(".navbar")?.clientHeight || 0;


           const handleDownloadPDF = () => {
          alert("Please close the sidebar to ensure complete content is printed.");
        
          const scrollableContainer = document.getElementById('blogs-section');
          
          // Clone the container to avoid modifying the original content
          const containerClone = scrollableContainer.cloneNode(true);
      
          // Remove video elements from the cloned container
          const videoElements = containerClone.querySelectorAll('video');
          videoElements.forEach(video => {
              video.parentNode.removeChild(video);
          });
      
          // Get the HTML content of the cloned container
          const htmlContent = containerClone.innerHTML;
        
          const title = currentPosts.length > 0 ? currentPosts[0].title : "";
        
          const printWindow = window.open('', '_blank');
          printWindow.document.open();
          printWindow.document.write(`
            <html>
              <head>
                <title>${title} | EduXcel | Sanjay Patidar</title>
              </head>
              <body>
                ${htmlContent}
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
      };
      
      return (
<>  
      <Helmet>
        <title>{`${currentPosts.length > 0 ? currentPosts[0].title : ""} | EduXcel | Sanjay Patidar`}</title>
                        <link rel="canonical" href={window.location.href} />

      </Helmet>
        <Box
          w="full"
          minH="100vh"
          mx="auto"
          d="flex"
          padding={`calc(${navbarHeight}px + 2rem) 2rem 2rem 2rem`}
          flexDir="column"
          alignItems="start"
          justifyContent="flex-start"
          id="blogs-section"
          overflowY="scroll"
          textAlign={"left"}
          maxHeight="calc(100vh - 100px)"
          height="auto"
          overflowX="hidden"
          boxShadow="0px 4px 8px rgba(0, 0, 0, 0.1)"
          onScroll={handleScroll}
          mt="0px"
          
        >
          {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          {loading && (
                    <>
                    <div style={{ marginRight: "20px" }}>
                      <ClipLoader color={"#FF6347"} loading={loading} size={20} />
                      <span style={{ color: "#FF6347", fontSize: "12px" }}>Fetching data...</span>
                    </div>
          
                    <div style={{ marginRight: "20px" }}>
                      <RingLoader color={"#36D7B7"} loading={loading} size={30} />
                      <span style={{ color: "#36D7B7", fontSize: "14px" }}>Preparing content...</span>
                    </div>
          
                  
                  </>
          
          )}
        </div>
        
         
          ) : (
            <>
              {/* Toggle Button */}
              <Button
                style={toggleButtonStyle}
                onClick={onToggle}
                leftIcon={isOpen ? <FaTimes /> : <FaBars />}
              >
                {isOpen ? "Close" : "Open"}
              </Button>
      
              {/* Sidebar */}
              <Collapse in={isOpen}>
                <Box style={sidebarStyle}>
   
                <VStack align="start" spacing={2}>
  {Object.keys(blogsData).map((collection) => (
    <VStack key={collection} align="start" spacing={2}>
      
      <Text fontSize="md" fontWeight="semibold" mb={2}>
        
        {`${collection.charAt(0).toUpperCase()}${collection.slice(1)}`}
      </Text>
      {filteredBlogs(collection).map((blog) => (
        
       <BlogTitle
       key={blog.title}
       title={blog.title}
       collection={collection}
       onClick={(title, collection) => handleTitleClick(title, collection)}
                                     ref={(el) => (titleRefs.current[`${collection}-${blog.title}`] = el)}

       location="sidebar" // Pass location prop indicating main content area
       
     />
     
      ))}
    </VStack>
  ))}
</VStack>      </Box>
              </Collapse>
      
              {/* Main Content */}
<Box id="main-content" mt={0} p={0} ml={isOpen ? "200px" : "0"}>
                <Box style={headerStyle}>
                  <VStack spacing={0} align="start" w="100%" marginTop="0">
                    <Input
                      type="text"
                      placeholder="Enter your desired job title or keywords"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      p={0}
                      marginTop={0}
                      borderWidth="5px"
                      rounded="md"
                      bg="white"
                      color="black"
                      mb={0}
                    />
                    <Box style={progressBarStyle} />
                    <Box style={remainingBarStyle} />
                  </VStack>
                  <IconButton
                    icon={<FaArrowCircleUp />}
                    aria-label="Scroll to Top"
                    onClick={scrollToTop}
                    style={scrollToTopButtonStyle}
                  />
                </Box>
      
                {currentPosts.map((blog, index) => (
                  <motion.div
                    key={blog.title}
                    ref={
                      index === currentPosts.length - 1
                        ? (node) => observeLastBlog(category, node)
                        : null
                    }
                  >
                    <div id={`title-${blog.title}`} ref={(el) => (titleRefs.current[blog.title] = el)}>
  <BlogTitle
    key={blog.title}
    title={blog.title}
    collection={category}
    onClick={() => handleTitleClick(blog.title, category)}
    location="main" // Pass location prop indicating sidebar
  />
  
  <Button 
  onClick={handleDownloadPDF} 
  isLoading={loading} 
  loadingText="Downloading..."
  style={{
    marginLeft: '20px', 
          marginTop: '0.5rem', 

    backgroundColor: 'rgb(63, 81, 181)', 
    color: 'white', 
    borderRadius: '30px',
    padding: '8px 20px',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s, transform 0.3s',
  }}
  hoverStyle={{
    backgroundColor: 'rgb(48, 63, 159)',
  }}
>
  <span style={{ marginRight: '8px' }}>🖨️</span> Print PDF
</Button>


<div style={{ marginTop: "30px", padding: "4px", border: "1px solid #ccc", color: "White", borderRadius: "8px" }}>
<div style={{ fontWeight: "bold", marginBottom: "10px", fontSize: "1.2rem" }}>Published By:</div>
<div style={{ display: "flex", alignItems: "center" }}>
  <a href="https://sanjay-patidar.vercel.app" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#007bff", marginRight: "20px", padding: "10px", borderRadius: "5px", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}>
    <span style={{ fontSize: "1.1rem", fontWeight: "bold" }}>Sanjay Patidar</span>
    <br />
    <span style={{ fontSize: "0.9rem", color: "#6c757d" }}>Click to visit Sanjay Patidar's website</span>
  </a>
  <span style={{ color: "#6c757d" }}>|</span>
  <a href="https://eduxcel.vercel.app" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#007bff", marginLeft: "20px", padding: "10px", borderRadius: "5px", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}>
    <span style={{ fontSize: "1.1rem", fontWeight: "bold" }}>Founder: EduXcel | Empowering Careers in Tech: Expert Insights, Cutting-Edge Education, and Skill Mastery</span>
    <br />
    <span style={{ fontSize: "0.9rem", color: "#6c757d" }}>Click to visit EduXcel's website</span>
  </a>
</div>
  <div style={{ marginTop: "20px", fontWeight: "bold", marginBottom: "10px" , fontSize: "1.2rem"}}>Keywords:</div>
  <div>{renderMediaContent(blog.keywords, blog.title)}</div>

  <div style={{ marginTop: "20px", fontWeight: "bold", marginBottom: "10px" , fontSize: "1.2rem"}}>Last Modified:</div>
  <div>{renderMediaContent(blog.Last_Modified, blog.title)}</div>
  
</div>
</div>
       <VStack spacing={2} id={`content-${blog.title}-overview`} style={contentSectionStyle}>
  {renderMediaContent(blog.overview, blog.title)}
</VStack>
  <div id={`content-${blog.title}-design`} style={contentSectionStyle}>
                      {renderMediaContent(blog.responsibilities?.design, blog.title)}
                    </div>

                    <div id={`content-${blog.title}-development`} style={contentSectionStyle}>
                      {renderMediaContent(blog.responsibilities?.development, blog.title)}
                    </div>
                    <div id={`content-${blog.title}-maintenance`} style={contentSectionStyle}>
                      {renderMediaContent(blog.responsibilities?.maintenance, blog.title)}
                    </div>

                    <div id={`content-${blog.title}-communication`} style={contentSectionStyle}>
                      {renderMediaContent(blog.responsibilities?.communication, blog.title)}
                    </div>

                    <div id={`content-${blog.title}-continous_learning`} style={contentSectionStyle}>
                      {renderMediaContent(blog.responsibilities?.continous_learning, blog.title)}
                    </div>

                  
<VStack spacing={2} id={`content-${blog.title}-description`} style={contentSectionStyle}>
  {renderMediaContent(blog.description, blog.title)}
</VStack>
<VStack spacing={2} id={`content-${blog.title}-responsibilities`} style={contentSectionStyle}>
  {renderMediaContent(blog.responsibilities, blog.title)}
</VStack>


{/* new */}


<VStack spacing={2} id={`content-${blog.title}-overview`} style={contentSectionStyle}>
  {renderMediaContent(blog.content?.overview, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-overview`} style={contentSectionStyle}>
  {renderMediaContent(blog.content?.topics?.History_of_HTML, blog.title)}
</VStack>


<VStack spacing={2} id={`content-${blog.title}-overview`} style={contentSectionStyle}>
  {renderMediaContent(blog.content?.topics?.History_of_HTML?.content?.overview, blog.title)}
</VStack>
<VStack spacing={2} id={`content-${blog.title}-overview`} style={contentSectionStyle}>
  {renderMediaContent(blog.content?.topics?.History_of_HTML?.content?.versions, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-overview`} style={contentSectionStyle}>
  {renderMediaContent(blog.content?.topics?.History_of_HTML?.content?.significance, blog.title)}
</VStack>


<VStack spacing={2} id={`content-${blog.title}-Purpose_of_HTML`} style={contentSectionStyle}>
  {renderMediaContent(blog.content?.topics?.Purpose_of_HTML, blog.title)}
</VStack>


<VStack spacing={2} id={`content-${blog.title}-structuring`} style={contentSectionStyle}>
  {renderMediaContent(blog.content?.topics?.Purpose_of_HTML?.content?.structuring, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-semantic_markup`} style={contentSectionStyle}>
  {renderMediaContent(blog.content?.topics?.Purpose_of_HTML?.content?.semantic_markup, blog.title)}
</VStack>
<VStack spacing={2} id={`content-${blog.title}-interactivity`} style={contentSectionStyle}>
  {renderMediaContent(blog.content?.topics?.Purpose_of_HTML?.content?.interactivity, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-Role_in_Web_Development`} style={contentSectionStyle}>
  {renderMediaContent(blog.content?.topics?.Role_in_Web_Development, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-frontend`} style={contentSectionStyle}>
  {renderMediaContent(blog.content?.topics?.Role_in_Web_Development?.content?.frontend, blog.title)}
</VStack>
<VStack spacing={2} id={`content-${blog.title}-integration`} style={contentSectionStyle}>
  {renderMediaContent(blog.content?.topics?.Role_in_Web_Development?.content?.integration, blog.title)}
</VStack>
<VStack spacing={2} id={`content-${blog.title}-compatibility`} style={contentSectionStyle}>
  {renderMediaContent(blog.content?.topics?.Role_in_Web_Development?.content?.compatibility, blog.title)}
</VStack>


<VStack spacing={2} id={`content-${blog.title}-Document_Type_Declaration`} style={contentSectionStyle}>
  {renderMediaContent(blog.components?.Document_Type_Declaration, blog.title)}
</VStack>
<VStack spacing={2} id={`content-${blog.title}-HTML_Element`} style={contentSectionStyle}>
  {renderMediaContent(blog.components?.HTML_Element, blog.title)}
</VStack>
<VStack spacing={2} id={`content-${blog.title}-Head_Section`} style={contentSectionStyle}>
  {renderMediaContent(blog.components?.Head_Section, blog.title)}
</VStack>
<VStack spacing={2} id={`content-${blog.title}-Body_Section`} style={contentSectionStyle}>
  {renderMediaContent(blog.components?.Body_Section, blog.title)}
</VStack>
<VStack spacing={2} id={`content-${blog.title}-HTML_Elements_and_Attributes`} style={contentSectionStyle}>
  {renderMediaContent(blog.components?.HTML_Elements_and_Attributes, blog.title)}
</VStack>
<VStack spacing={2} id={`content-${blog.title}-Semantic_HTML`} style={contentSectionStyle}>
  {renderMediaContent(blog.components?.Semantic_HTML, blog.title)}
</VStack>
<VStack spacing={2} id={`content-${blog.title}-Comments`} style={contentSectionStyle}>
  {renderMediaContent(blog.components?.Comments, blog.title)}
</VStack>
<VStack spacing={2} id={`content-${blog.title}-Text_Elements`} style={contentSectionStyle}>
  {renderMediaContent(blog.html_elements_and_tags?.Text_Elements, blog.title)}
</VStack>
<VStack spacing={2} id={`content-${blog.title}-Inline_Elements`} style={contentSectionStyle}>
  {renderMediaContent(blog.html_elements_and_tags?.Inline_Elements, blog.title)}
</VStack>
<VStack spacing={2} id={`content-${blog.title}-Semantic_Elements`} style={contentSectionStyle}>
  {renderMediaContent(blog.html_elements_and_tags?.Semantic_Elements, blog.title)}
</VStack>
<VStack spacing={2} id={`content-${blog.title}-Table_Elements`} style={contentSectionStyle}>
  {renderMediaContent(blog.html_elements_and_tags?.Table_Elements, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-Form_Elements`} style={contentSectionStyle}>
  {renderMediaContent(blog.html_elements_and_tags?.Form_Elements, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-Media_Elements`} style={contentSectionStyle}>
  {renderMediaContent(blog.html_elements_and_tags?.Media_Elements, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-Meta_Elements`} style={contentSectionStyle}>
  {renderMediaContent(blog.html_elements_and_tags?.Form_Elements, blog.title)}
</VStack>




                  </motion.div>
                ))}
      
              </Box>
            </>
          )}
        </Box>

        </>

      );

      };

      
      export default CourseDetails;
      
