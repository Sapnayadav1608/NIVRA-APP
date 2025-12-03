# 📤 GitHub Upload Steps

## Manual Upload (No Git):

### 1. Create New Repository
- GitHub pe "+" click karo
- "New repository" select karo
- Name: `NIVRA-APP`
- Public repository banao
- "Create repository" click karo

### 2. Upload Files
- "uploading an existing file" link click karo
- Ya "Add file" → "Upload files"
- **Drag entire NIVRA-APP folder** (except node_modules)
- "Commit changes" click karo

### 3. Back to Render
- Render pe GitHub connect karo
- NIVRA-APP repository select karo
- Deploy settings:
  ```
  Root Directory: server
  Build Command: npm install  
  Start Command: npm start
  ```

**Alternative: ZIP Upload**
1. NIVRA-APP folder ko ZIP karo
2. GitHub pe drag & drop karo
3. Extract automatically ho jayega

**Ready for deployment! 🚀**