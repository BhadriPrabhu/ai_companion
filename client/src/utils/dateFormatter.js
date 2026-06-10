export const formatDate = (isoString, includeTime = false) => {
  if (!isoString) return "N/A"; // Handle null or undefined cases gracefully
  
  const date = new Date(isoString);
  
  // Base configuration for just the date
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  // If includeTime is true, dynamically inject the time properties
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.hour12 = true;
  }
  
  return new Intl.DateTimeFormat('en-US', options).format(date);
};