    /* eslint-disable react/prop-types */
    /* eslint-disable react/display-name */
    import React, { useState,useMemo, useEffect, useRef, useCallback } from "react";
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
    import { Helmet } from "react-helmet-async";  // Import Helmet

    import {
    
      RingLoader,
      SyncLoader,
      ClipLoader,
    
    } from "react-spinners";
    
    import { motion } from "framer-motion";
    import ModalImage from "react-modal-image"; 

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
    
    const BlogTitle = React.forwardRef(({ title, collection, onClick, location }, ref) => {
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
              to={`/careers/${collection}/${slug}`} 
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
    
   


    const Career = () => {
      const [blogsData, setBlogsData] = useState({
        careers: [],
        choice: [],
      });
      const [loading, setLoading] = useState(true);

      const [currentPage, setCurrentPage] = useState(1);
      const [postsPerPage] = useState(1); 
      const navigate = useNavigate();
      const titleRefs = useRef({});
      const { isOpen, onToggle } = useDisclosure();
      const [lastVisitedBlog, setLastVisitedBlog] = useState(null);

      const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            func(...args);
          }, delay);
        };
      };
      
      const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
      };  
      const observer = useRef();

      const [searchQuery, setSearchQuery] = useState("");
      const [scrollProgress, setScrollProgress] = useState(0);
      const [remainingProgress, setRemainingProgress] = useState(100);

      const location = useLocation();
      const [clickedTitle, setClickedTitle] = useState(null);
      const scrollToTitle = (title, collection, isChildTitle) => {
        const titleRef = titleRefs.current[`${collection}-${title}`];
        if (titleRef) {
          titleRef.scrollIntoView({
            behavior: "smooth",
            block: isChildTitle ? "center" : "start",
          });
        }
      };

      const handleSearchChange = (event) => {
        const newQuery = event.target.value;
        setSearchQuery(newQuery);
        navigate(`/careers/search/${encodeURIComponent(newQuery)}`);
      };
      const fetchData = async (collection) => {
        try {
          const response = await fetch(
            `https://eduxcel-api-13march.onrender.com/api/${collection}`
          );
          const responseData = await response.json();
          setBlogsData((prevData) => ({
            ...prevData,
            [collection]: responseData,
          }));
        } catch (error) {
          console.error(`Error fetching ${collection} data:`, error);
        }
      };

      const fetchDataForAllCollections = async () => {
        const collections = ["careers", "choice"];
        const promises = collections.map((collection) => fetchData(collection));
        await Promise.all(promises);
      };
      const filteredBlogs = (collection) => {
        const blogsCollection = blogsData[collection] || [];
        return blogsCollection.filter((blog) =>
          blog.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }; 
    useEffect(() => {
  fetchDataForAllCollections().then(() => setLoading(false));
}, []);

      const debouncedSearchChange = useCallback(debounce(handleSearchChange, 500), []);
    
      useEffect(() => {
        debouncedSearchChange(searchQuery);
      }, [debouncedSearchChange, searchQuery]);
    
      const filteredBlogsMemoized = useMemo(() => {
        return Object.keys(blogsData).reduce((acc, collection) => {
          acc[collection] = filteredBlogs(collection);
          return acc;
        }, {});
      }, [blogsData]);
    
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
      
            navigate(`/careers/${collection}/${slug}`, {
              replace: true,
            });
      
            setCurrentPage(pageIndex);
      
            // Set the title dynamically when a title is clicked
            document.title = `${matchingBlog.title} | Eduxcel`; 
          }
          setLastVisitedBlog({ title, collection });
        }, [blogsData, navigate, postsPerPage, setCurrentPage, setLastVisitedBlog]);
      

      useEffect(() => {
        const query = location.pathname.split("/careers/search/")[1] || "";
        setSearchQuery(decodeURIComponent(query));
        fetchDataForAllCollections();
    
        if (clickedTitle) {
          // Reset the clicked title state
          setClickedTitle(null);
        }
    
        // Check for title in URL and display the content directly
        const urlTitleMatch = location.pathname.match(/\/careers\/(.+?)\/(.+)/);
        if (urlTitleMatch) {
          const [, collection, encodedTitle] = urlTitleMatch;
          const urlTitle = decodeURIComponent(encodedTitle);
          const matchingBlog = blogsData[collection]?.find(
            (blog) =>
                slugify(blog.title) === urlTitle ||
          (blog.parentTitle && blog.parentTitle.title === urlTitle) ||
          
          (blog.entry_level && blog.entry_level.title === urlTitle) ||
          (blog.common_questions && blog.common_questions.title === urlTitle) ||

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
      }, [blogsData, fetchDataForAllCollections, location, postsPerPage, setCurrentPage]);
         const indexOfLastPost = currentPage * postsPerPage;
      const indexOfFirstPost = indexOfLastPost - postsPerPage;
      const currentPosts = filteredBlogs("careers").slice(indexOfFirstPost, indexOfLastPost);

    

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
        top: "190px",
        left: 0,
        height: "100%",
        width: "200px",
        backgroundColor: "black",
        borderRight: "1px solid lightgray",
        padding: "20px",
        zIndex: 2,
        transition: "left 0.3s",
        overflowX: "hidden",
        overflowY: "auto", 
  maxHeight: "calc(100% - 200px)", 
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

      // Rotating animation on toggle
      toggleButtonStyle.rotate = {
        transform: isOpen ? "rotate(180deg)" : "rotate(0)",
        transition: "transform 0.3s",
      };

      // Hover effect
      toggleButtonStyle["&:hover"] = {
        background: isOpen ? "#c0392b" : "#27ae60", // Darker red when open, darker green when closed
      };

      // Pulse animation on hover
      toggleButtonStyle["&:hover"].pulse = {
        animation: "pulse 0.5s infinite",
      };

      // Keyframe animation for pulse
      toggleButtonStyle["@keyframes pulse"] = {
        "0%": {
          transform: "scale(1)",
        },
        "50%": {
          transform: "scale(1.2)",
        },
        "100%": {
          transform: "scale(1)",
        },
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
                  collection="careers"
                  onClick={() => handleTitleClick(item.title, "careers")}
                />
                {renderMediaContent(item.description, title)}
                {renderMediaContent(item.installation, title)}
                {renderMediaContent(item.content, title)}
                {renderMediaContent(item.steps, title)}
                {renderMediaContent(item.career_path, title)}
                {renderMediaContent(item.entry_level, title)}


                 {renderMediaContent(item.components, title)}
                 {renderMediaContent(item.whatIsJdk, title)}
                                  {renderMediaContent(item.whatIsJvm, title)}



                {renderMediaContent(item.jvm, title)}
                
                {renderMediaContent(item.jdk, title)}

                {renderMediaContent(item.settingUpJavaDevelopmentEnvironment, title)}
                {renderMediaContent(item.overview, title)}
               {renderMediaContent(item.settings, title)} 
                
               {renderMediaContent(item.features, title)} 
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
      return (
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
          mt="50px"
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
          
                    <div>
                      <SyncLoader color={"#5E35B1"} loading={loading} size={40} />
                      <span style={{ color: "#5E35B1", fontSize: "16px" }}>Almost there...</span>
                    </div>
                    {/* Add more loaders or customize the existing ones */}
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
</VStack>


                </Box>
              </Collapse>
      
              {/* Main Content */}
              <Box mt={0} p={0} ml={isOpen ? "200px" : "0"}>
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
                        ? (node) => observeLastBlog("careers", node)
                        : null
                    }
                  >
                    <div id={`title-${blog.title}`} ref={(el) => (titleRefs.current[blog.title] = el)}>
  <BlogTitle
    key={blog.title}
    title={blog.title}
    collection="careers"
    onClick={() => handleTitleClick(blog.title, "careers")}
    location="main" // Pass location prop indicating sidebar
  />
<div style={{ marginTop: "30px", padding: "10px", border: "1px solid #ccc", color: "White", borderRadius: "8px" }}>
<div style={{ fontWeight: "bold", marginBottom: "10px", fontSize: "1.2rem" }}>Published By:</div>
<div style={{ display: "flex", alignItems: "center" }}>
  <a href="https://sanjay-patidar.vercel.app" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#007bff", marginRight: "20px", padding: "10px", borderRadius: "5px", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}>
    <span style={{ fontSize: "1.1rem", fontWeight: "bold" }}>Sanjay Patidar</span>
    <br />
    <span style={{ fontSize: "0.9rem", color: "#6c757d" }}>Click to visit Sanjay Patidar's website</span>
  </a>
  <span style={{ color: "#6c757d" }}>|</span>
  <a href="https://eduxcel.vercel.app" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#007bff", marginLeft: "20px", padding: "10px", borderRadius: "5px", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}>
    <span style={{ fontSize: "1.1rem", fontWeight: "bold" }}>Founder: EduXcel - Nurturing Excellence through Online Education</span>
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
<VStack spacing={2} id={`content-${blog.title}-skills`} style={contentSectionStyle}>
  {renderMediaContent(blog.skills, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-career_path`} style={contentSectionStyle}>
  {renderMediaContent(blog.career_path, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-entry_level`} style={contentSectionStyle}>
  {renderMediaContent(blog.entry_level, blog.title)}
</VStack>
{/* new  */}
<VStack spacing={2} id={`content-${blog.title}-career_outlook`} style={contentSectionStyle}>
  {renderMediaContent(blog.career_outlook, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-common_questions`} style={contentSectionStyle}>
  {renderMediaContent(blog.common_questions, blog.title)}
</VStack>


<VStack spacing={2} id={`content-${blog.title}-entry_level`} style={contentSectionStyle}>
{renderMediaContent(blog.career_path?.entry_level, blog.title)}
</VStack>



<VStack spacing={2} id={`content-${blog.title}-mid_level`} style={contentSectionStyle}>
{renderMediaContent(blog.career_path?.mid_level, blog.title)}
</VStack>



<VStack spacing={2} id={`content-${blog.title}-senior_level`} style={contentSectionStyle}>
{renderMediaContent(blog.career_path?.senior_level, blog.title)}
</VStack>








<VStack spacing={2} id={`content-${blog.title}-extension3`} style={contentSectionStyle}>
  {renderMediaContent(blog.extension3, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-extension4`} style={contentSectionStyle}>
  {renderMediaContent(blog.extension4, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-extension5`} style={contentSectionStyle}>
  {renderMediaContent(blog.extension5, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-slow_performance`} style={contentSectionStyle}>
  {renderMediaContent(blog.slow_performance, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-intellisense_not_working`} style={contentSectionStyle}>
  {renderMediaContent(blog.intellisense_not_working, blog.title)}
</VStack>
<VStack spacing={2} id={`content-${blog.title}-debugging_issues`} style={contentSectionStyle}>
  {renderMediaContent(blog.debugging_issues, blog.title)}
</VStack>








<VStack spacing={2} id={`content-${blog.title}-best_practice`} style={contentSectionStyle}>
  {renderMediaContent(blog.best_practice, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-common_issues`} style={contentSectionStyle}>
  {renderMediaContent(blog.common_issues, blog.title)}
</VStack>



<VStack spacing={2} id={`content-${blog.title}-common_tasks`} style={contentSectionStyle}>
  {renderMediaContent(blog.common_tasks, blog.title)}
</VStack>







 

<VStack spacing={2} id={`content-${blog.title}-installation_problems`} style={contentSectionStyle}>
  {renderMediaContent(blog.installation_problems, blog.title)}
</VStack><VStack spacing={2} id={`content-${blog.title}-extension_compatibility`} style={contentSectionStyle}>
  {renderMediaContent(blog.extension_compatibility, blog.title)}
</VStack><VStack spacing={2} id={`content-${blog.title}-workspace_configuration`} style={contentSectionStyle}>
  {renderMediaContent(blog.workspace_configuration, blog.title)}
</VStack><VStack spacing={2} id={`content-${blog.title}-content`} style={contentSectionStyle}>
  {renderMediaContent(blog.content, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-needForAdvancedTechniques`} style={contentSectionStyle}>
  {renderMediaContent(blog.needForAdvancedTechniques, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-issues`} style={contentSectionStyle}>
  {renderMediaContent(blog.issues, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-what_jvm`} style={contentSectionStyle}>
  {renderMediaContent(blog.what_jvm, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-feature_jvm`} style={contentSectionStyle}>
  {renderMediaContent(blog.feature_jvm, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-setting`} style={contentSectionStyle}>
  {renderMediaContent(blog.setting, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-ideas`} style={contentSectionStyle}>
  {renderMediaContent(blog.ideas, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-shortcuts`} style={contentSectionStyle}>
  {renderMediaContent(blog.shortcuts, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-tips`} style={contentSectionStyle}>
  {renderMediaContent(blog.tips, blog.title)}
</VStack>


<VStack spacing={2} id={`content-${blog.title}-tools`} style={contentSectionStyle}>
  {renderMediaContent(blog.tools, blog.title)}
</VStack>


<VStack spacing={2} id={`content-${blog.title}-features`} style={contentSectionStyle}>
  {renderMediaContent(blog.features, blog.title)}
</VStack>


<VStack spacing={2} id={`content-${blog.title}-getting_started`} style={contentSectionStyle}>
  {renderMediaContent(blog.getting_started, blog.title)}
</VStack>


<VStack spacing={2} id={`content-${blog.title}-profiling`} style={contentSectionStyle}>
  {renderMediaContent(blog.profiling, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-collaboration`} style={contentSectionStyle}>
  {renderMediaContent(blog.collaboration, blog.title)}
</VStack>
<VStack spacing={2} id={`content-${blog.title}-customization`} style={contentSectionStyle}>
  {renderMediaContent(blog.customization, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-environments`} style={contentSectionStyle}>
  {renderMediaContent(blog.environments, blog.title)}
</VStack>


<VStack spacing={2} id={`content-${blog.title}-packages`} style={contentSectionStyle}>
  {renderMediaContent(blog.packages, blog.title)}
</VStack>


<VStack spacing={2} id={`content-${blog.title}-data_manipulation`} style={contentSectionStyle}>
  {renderMediaContent(blog.data_manipulation, blog.title)}
</VStack>


<VStack spacing={2} id={`content-${blog.title}-data_analysis`} style={contentSectionStyle}>
  {renderMediaContent(blog.data_analysis, blog.title)}
</VStack>


<VStack spacing={2} id={`content-${blog.title}-machine_learning`} style={contentSectionStyle}>
  {renderMediaContent(blog.machine_learning, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-data_visualization`} style={contentSectionStyle}>
  {renderMediaContent(blog.data_visualization, blog.title)}
</VStack>


<VStack spacing={2} id={`content-${blog.title}-optimization`} style={contentSectionStyle}>
  {renderMediaContent(blog.optimization, blog.title)}
</VStack>


<VStack spacing={2} id={`content-${blog.title}-best_practices`} style={contentSectionStyle}>
  {renderMediaContent(blog.best_practices, blog.title)}
</VStack>


<VStack spacing={2} id={`content-${blog.title}-troubleshooting`} style={contentSectionStyle}>
  {renderMediaContent(blog.troubleshooting, blog.title)}
</VStack>


<VStack spacing={2} id={`content-${blog.title}-code_analysis`} style={contentSectionStyle}>
  {renderMediaContent(blog.code_analysis, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-database_tools`} style={contentSectionStyle}>
  {renderMediaContent(blog.database_tools, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-build_tools`} style={contentSectionStyle}>
  {renderMediaContent(blog.build_tools, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-spring_support`} style={contentSectionStyle}>
  {renderMediaContent(blog.spring_support, blog.title)}
</VStack>

{/* new  */}

<VStack spacing={2} id={`content-${blog.title}-modules`} style={contentSectionStyle}>
  {renderMediaContent(blog.modules, blog.title)}
</VStack>


<VStack spacing={2} id={`content-${blog.title}-package_management`} style={contentSectionStyle}>
  {renderMediaContent(blog.package_management, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-routing`} style={contentSectionStyle}>
  {renderMediaContent(blog.routing, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-middleware`} style={contentSectionStyle}>
  {renderMediaContent(blog.middleware, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-templating_engines`} style={contentSectionStyle}>
  {renderMediaContent(blog.templating_engines, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-restful_apis`} style={contentSectionStyle}>
  {renderMediaContent(blog.restful_apis, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-callbacks`} style={contentSectionStyle}>
  {renderMediaContent(blog.callbacks, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-promises`} style={contentSectionStyle}>
  {renderMediaContent(blog.promises, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-async_await`} style={contentSectionStyle}>
  {renderMediaContent(blog.async_await, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-event_emitters`} style={contentSectionStyle}>
  {renderMediaContent(blog.event_emitters, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-deployment_strategies`} style={contentSectionStyle}>
  {renderMediaContent(blog.deployment_strategies, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-scaling`} style={contentSectionStyle}>
  {renderMediaContent(blog.scaling, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-installing_nodejs`} style={contentSectionStyle}>
  {renderMediaContent(blog.installing_nodejs, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-configuring_npm`} style={contentSectionStyle}>
  {renderMediaContent(blog.configuring_npm, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-basic_project_setup`} style={contentSectionStyle}>
  {renderMediaContent(blog.basic_project_setup, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-installing_git`} style={contentSectionStyle}>
  {renderMediaContent(blog.installing_git, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-configuring_git`} style={contentSectionStyle}>
  {renderMediaContent(blog.configuring_git, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-git_commands`} style={contentSectionStyle}>
  {renderMediaContent(blog.git_commands, blog.title)}
</VStack>


<VStack spacing={2} id={`content-${blog.title}-typical_workflow`} style={contentSectionStyle}>
  {renderMediaContent(blog.typical_workflow, blog.title)}
</VStack>


<VStack spacing={2} id={`content-${blog.title}-best_practices`} style={contentSectionStyle}>
  {renderMediaContent(blog.best_practices, blog.title)}
</VStack>


<VStack spacing={2} id={`content-${blog.title}-branching_strategies`} style={contentSectionStyle}>
  {renderMediaContent(blog.branching_strategies, blog.title)}
</VStack>


<VStack spacing={2} id={`content-${blog.title}-git_hooks`} style={contentSectionStyle}>
  {renderMediaContent(blog.git_hooks, blog.title)}
</VStack>


<VStack spacing={2} id={`content-${blog.title}-optimizing_workflow`} style={contentSectionStyle}>
  {renderMediaContent(blog.optimizing_workflow, blog.title)}
</VStack>


<VStack spacing={2} id={`content-${blog.title}-collaborative_platforms`} style={contentSectionStyle}>
  {renderMediaContent(blog.collaborative_platforms, blog.title)}
</VStack>


<VStack spacing={2} id={`content-${blog.title}-collaborative_workflows`} style={contentSectionStyle}>
  {renderMediaContent(blog.collaborative_workflows, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-setting_up_repository`} style={contentSectionStyle}>
  {renderMediaContent(blog.setting_up_repository, blog.title)}
</VStack>


<VStack spacing={2} id={`content-${blog.title}-collaborative_workflow `} style={contentSectionStyle}>
  {renderMediaContent(blog.collaborative_workflow, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-github_actions`} style={contentSectionStyle}>
  {renderMediaContent(blog.github_actions, blog.title)}
</VStack>


<VStack spacing={2} id={`content-${blog.title}-dask`} style={contentSectionStyle}>
  {renderMediaContent(blog.dask, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-vaex`} style={contentSectionStyle}>
  {renderMediaContent(blog.vaex, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-optimizationStrategies`} style={contentSectionStyle}>
  {renderMediaContent(blog.optimizationStrategies, blog.title)}
</VStack>
<VStack spacing={2} id={`content-${blog.title}-parallelComputing`} style={contentSectionStyle}>
  {renderMediaContent(blog.parallelComputing , blog.title)}
</VStack>
{/* new  */}

<VStack spacing={2} id={`content-${blog.title}-settingUpGit`} style={contentSectionStyle}>
  {renderMediaContent(blog.settingUpGit , blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-configuringUsernameAndEmail
`} style={contentSectionStyle}>
  {renderMediaContent(blog.configuringUsernameAndEmail, blog.title)}
</VStack>                

<VStack spacing={2} id={`content-${blog.title}-configuringEditorAndDefaultBranch
`} style={contentSectionStyle}>
  {renderMediaContent(blog.configuringEditorAndDefaultBranch, blog.title)}
</VStack>  

{/* new33333333 */}

<VStack spacing={2} id={`content-${blog.title}-jvm`} style={contentSectionStyle}>
{renderMediaContent(blog.components?.jdk, blog.title)}
</VStack>




<VStack spacing={2} id={`content-${blog.title}-jvm`} style={contentSectionStyle}>
{renderMediaContent(blog.components?.jvm, blog.title)}
</VStack>


<VStack spacing={2} id={`content-${blog.title}-whatIsJdk`} style={contentSectionStyle}>
  {renderMediaContent(blog.whatIsJdk, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-whatIsJvm`} style={contentSectionStyle}>
  {renderMediaContent(blog.whatIsJvm, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-settingUpJavaDevelopmentEnvironment`} style={contentSectionStyle}>
  {renderMediaContent(blog.components?.settingUpJavaDevelopmentEnvironment, blog.title)}
</VStack>

<VStack spacing={2} id={`content-${blog.title}-components`} style={contentSectionStyle}>
  {renderMediaContent(blog.components, blog.title)}
</VStack>
 <div id={`content-${blog.title}-ProgrammingLanguages`} style={contentSectionStyle}>
                      {renderMediaContent(blog.skills?.ProgrammingLanguages, blog.title)}
                    </div>
                    <div id={`content-${blog.title}-BackendDevelopment`} style={contentSectionStyle}>
                      {renderMediaContent(blog.skills?.BackendDevelopment, blog.title)}
                    </div>
                    <div id={`content-${blog.title}-VersionControlSystems`} style={contentSectionStyle}>
                      {renderMediaContent(blog.skills?.VersionControlSystems, blog.title)}
                    </div>
                    <div id={`content-${blog.title}-WebDevelopmentToolsAndTechnologies`} style={contentSectionStyle}>
                      {renderMediaContent(blog.skills?.WebDevelopmentToolsAndTechnologies, blog.title)}
                    </div>
                    <div id={`content-${blog.title}-ProblemSolvingAndDebugging`} style={contentSectionStyle}>
                      {renderMediaContent(blog.skills?.ProblemSolvingAndDebugging, blog.title)}
                    </div>
                    <div id={`content-${blog.title}-SoftSkills`} style={contentSectionStyle}>
                      {renderMediaContent(blog.skills?.SoftSkills, blog.title)}
                    </div>  
                    <div id={`content-${blog.title}-ContinuousLearningAndAdaptability`} style={contentSectionStyle}>
                      {renderMediaContent(blog.skills?.ContinuousLearningAndAdaptability, blog.title)}
                    </div>  
                 
      

                  </motion.div>
                ))}
      
              </Box>
            </>
          )}
        </Box>
      );
      };
      
      export default Career;
      
