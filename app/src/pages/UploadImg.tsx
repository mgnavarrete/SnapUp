import React, { useState } from 'react';
import { Grid, Typography, Button, LinearProgress, Box, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, TextField } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import axios, { AxiosRequestConfig, AxiosProgressEvent } from 'axios';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

interface LinearProgressWithLabelProps {
  value: number;
  message: string;
}

const LinearProgressWithLabel: React.FC<LinearProgressWithLabelProps> = (props) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#DCA47C' }}>
      <Typography variant="body2" sx={{ mb: 1, color: '#DCA47C' }}>{props.message}</Typography>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" value={props.value} sx={{ color: '#DCA47C' }} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary" sx={{ color: '#DCA47C' }}>{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
};

const UploadFiles: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string>('Los archivos están siendo subidos, por favor espera...');
  const [photographerName, setPhotographerName] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);

      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length > 35) {
      setUploadMessage('Máximo de archivos para subir es 35.');
      setOpen(true);
      return;
    }

    if (selectedFiles.length > 0) {
      setOpen(true);
      setUploadMessage('Subiendo archivos, por favor espera...');
      setUploadProgress(0);

      try {
        for (let i = 0; i < selectedFiles.length; i++) {
          await uploadFile(selectedFiles[i], i, selectedFiles.length);
        }
        setUploadProgress(100);
        setUploadMessage('Archivos subidos correctamente.');
        setSelectedFiles([]);
        setPreviews([]);
      } catch (error) {
        setUploadMessage('Error subiendo los archivos.');
      }
    }
  };

  const uploadFile = async (file: File, index: number, totalFiles: number) => {
    const formData = new FormData();
    formData.append('files', file);
    formData.append('photographerName', photographerName); 

    const config: AxiosRequestConfig = {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(((index + (progressEvent.loaded / progressEvent.total)) / totalFiles) * 100);
          setUploadProgress(percentCompleted);
        }
      }
    };

    try {
      await axios.post('http://mentaflix.ddns.net:5000/upload', formData, config);
    } catch (error) {
      console.error('Error subiendo los archivos:', error);
      throw error;
    }
  };

  const handleClose = () => {
    setOpen(false);
    setUploadMessage('Subiendo archivos, por favor espera...');
    setUploadProgress(0);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setPreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', padding: { xs: 2, md: 0 } }}>
      <Box sx={{ width: '100%', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <Typography variant="h1" sx={{ fontWeight: 'bold', textAlign: 'center', fontSize: { xs: '40px', md: '70px' } }}>
          Sube tus archivos
        </Typography>
        
        <Box sx={{ width: '100%', marginTop: 3, textAlign: 'center' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
                {previews.map((preview, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: 'relative',
                      width: 150,
                      height: 150,
                      overflow: 'hidden',
                      borderRadius: 2,
                      boxShadow: 1,
                      '&:hover .delete-icon': {
                        display: 'flex',
                      },
                    }}
                  >
                    {/\.(jpg|jpeg|png|gif)$/i.test(selectedFiles[index].name) ? (
                      <img src={preview} alt={`preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <video src={preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} controls />
                    )}
                    <IconButton
                      aria-label="delete"
                      onClick={() => handleRemoveFile(index)}
                      className="delete-icon"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        display: 'none',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 1)',
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
            label="Nombre del Fotógrafo"
            margin="normal"
            sx={{ width: { xs: '100%', md: '300px' }, marginTop: { xs: 2, md: 3 }, marginBottom: 0}}
            variant="filled"
            value={photographerName}
            onChange={(e) => setPhotographerName(e.target.value)}
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center'}}>
          <Typography  margin="normal" variant="body2" sx={{width: { xs: '100%', md: '300px' }, marginTop: '0px', mb: 1, fontSize: '11px', marginBottom: '1px'}}> *Si escribes tu nombre podrás filtrar los archivos y ver las fotos que has subido.</Typography>
            </Box>
          </Grid>

       
    
            <Grid item xs={12}>
              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
                sx={{ marginRight: '10px', fontSize: '15px' }}
              >
                Cargar Archivos
                <input type="file" name="files" hidden multiple onChange={handleFileChange} />
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={selectedFiles.length === 0} 
                sx={{ fontSize: '15px' }}
              >
                Subir
              </Button>

              <Typography variant="body2" sx={{ marginTop: '15px', mb: 1 }}>
                {`${selectedFiles.length} archivos cargados`}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <BootstrapDialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
        <DialogTitle sx={{ m: 0, p: 2, color:'#698474' }} id="customized-dialog-title">
          Subiendo Archivos
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ color: '#DCA47C' }}>
          <LinearProgressWithLabel value={uploadProgress} message={uploadMessage} />
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} sx={{ color: '#DCA47C' }}>
            Cerrar
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </Box>
  );
};

export default UploadFiles;
