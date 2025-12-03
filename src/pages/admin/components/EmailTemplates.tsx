import React, { useState, useEffect } from 'react';
import { Mail, Plus, Edit, Trash2, Save, CheckCircle, XCircle } from 'lucide-react';
import api from '../../../utils/axios';
import { THEME_CONFIG, ThemeConfig } from '../../../components/home/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { toast } from '../../../utils/toast';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

const EmailTemplates: React.FC = () => {
  const { isDark } = useTheme();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    type: 'notification',
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/email-templates', { withCredentials: true });
      if (response.data?.status === 'success') {
        setTemplates(response.data.templates || []);
      } else {
        // Fallback to empty array if no templates
        setTemplates([]);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      // Fallback to empty array on error
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setShowSuccessModal(false);
      setShowErrorModal(false);
      
      const templateData = editingTemplate 
        ? { ...formData, id: editingTemplate.id }
        : formData;
      
      // Call backend API to save template
      const endpoint = editingTemplate 
        ? `/admin/email-templates/${editingTemplate.id}`
        : '/admin/email-templates';
      
      const method = editingTemplate ? 'put' : 'post';
      const response = await api[method](endpoint, templateData, { withCredentials: true });
      
      if (response.data?.status === 'success') {
        setShowSuccessModal(true);
        setShowCreateModal(false);
        setEditingTemplate(null);
        resetForm();
        fetchTemplates();
        // Auto-close success modal after 2 seconds
        setTimeout(() => setShowSuccessModal(false), 2000);
      } else {
        setErrorMessage(response.data?.message || 'Failed to save email template');
        setShowErrorModal(true);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to save email template';
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;
    
    try {
      await api.delete(`/admin/email-templates/${templateToDelete}`, { withCredentials: true });
      toast.success('Email template deleted successfully!');
      setShowDeleteModal(false);
      setTemplateToDelete(null);
      fetchTemplates();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete email template');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', subject: '', body: '', type: 'notification' });
  };

  if (loading) {
    return <div style={{ color: colors.text, textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1 style={{ color: colors.text, fontSize: '28px', fontWeight: 'bold' }}>Email Templates</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '8px',
            background: colors.accent,
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          <Plus size={18} />
          Create Template
        </button>
      </div>

      <div
        style={{
          background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          borderRadius: '12px',
          padding: '20px',
          border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        }}
      >
        {templates.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {templates.map((template) => (
              <div
                key={template.id}
                style={{
                  padding: '16px',
                  background: colors.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Mail size={20} color={colors.accent} />
                  <div>
                    <div style={{ color: colors.text, fontSize: '14px', fontWeight: '500' }}>
                      {template.name}
                    </div>
                    <div style={{ color: colors.textSecondary, fontSize: '12px' }}>
                      {template.subject}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setEditingTemplate(template)}
                    style={{
                      padding: '6px',
                      background: 'transparent',
                      border: 'none',
                      color: colors.accent,
                      cursor: 'pointer',
                    }}
                    title="Edit Template"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setTemplateToDelete(template.id);
                      setShowDeleteModal(true);
                    }}
                    style={{
                      padding: '6px',
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                    }}
                    title="Delete Template"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: colors.textSecondary, textAlign: 'center', padding: '40px' }}>
            No email templates found
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingTemplate) && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => {
            setShowCreateModal(false);
            setEditingTemplate(null);
            resetForm();
          }}
        >
          <div
            style={{
              background: colors.isDark ? '#1a1a2e' : '#ffffff',
              borderRadius: '12px',
              padding: '30px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ color: colors.text, fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  Template Name
                </label>
                <input
                  type="text"
                  value={editingTemplate?.name || formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    color: colors.text,
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ color: colors.text, fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  Subject
                </label>
                <input
                  type="text"
                  value={editingTemplate?.subject || formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    color: colors.text,
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ color: colors.text, fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  Body (HTML with inline styles)
                </label>
                <div style={{ 
                  marginBottom: '8px', 
                  padding: '8px', 
                  background: colors.isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: colors.textSecondary,
                }}>
                  <strong>💡 Tip:</strong> Use variables like <code style={{ background: colors.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)', padding: '2px 4px', borderRadius: '3px' }}>{'{{fullName}}'}</code>, <code style={{ background: colors.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)', padding: '2px 4px', borderRadius: '3px' }}>{'{{email}}'}</code>, <code style={{ background: colors.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)', padding: '2px 4px', borderRadius: '3px' }}>{'{{companyName}}'}</code> etc.
                  <br />
                  <strong>🎨 Styling:</strong> Use inline styles (style="background: #0B1B3B; color: white;") for email clients compatibility.
                </div>
                <textarea
                  value={editingTemplate?.body || formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={15}
                  placeholder={`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #f9f9f9;">
    <div style="background: linear-gradient(135deg, #0B1B3B 0%, #1A345B 100%); color: white; padding: 30px; text-align: center;">
      <h1 style="margin: 0;">Welcome {{fullName}}!</h1>
    </div>
    <div style="padding: 30px; background: white;">
      <p>Hi {{fullName}},</p>
      <p>Welcome to {{companyName}}!</p>
      <p>Your email: {{email}}</p>
    </div>
  </div>
</body>
</html>`}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    color: colors.text,
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'monospace',
                    lineHeight: '1.5',
                  }}
                />
                <div style={{ 
                  marginTop: '8px', 
                  padding: '10px', 
                  background: colors.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: colors.textSecondary,
                }}>
                  <strong>Available Variables:</strong> fullName, firstName, lastName, email, companyName, phone, frontendUrl, verificationLink, resetLink, amount, tier, code, currentDate, currentYear
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTemplate(null);
                    resetForm();
                  }}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    background: 'transparent',
                    color: colors.text,
                    border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    background: colors.accent,
                    color: 'white',
                    border: 'none',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
          }}
          onClick={() => setShowSuccessModal(false)}
        >
          <div
            style={{
              background: colors.isDark ? '#1a1a2e' : '#ffffff',
              borderRadius: '12px',
              padding: '30px',
              width: '90%',
              maxWidth: '400px',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <CheckCircle size={48} color="#10b981" style={{ marginBottom: '16px' }} />
            <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
              Success!
            </h2>
            <p style={{ color: colors.textSecondary, fontSize: '14px', marginBottom: '20px' }}>
              Email template saved successfully!
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                background: colors.accent,
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
          }}
          onClick={() => setShowErrorModal(false)}
        >
          <div
            style={{
              background: colors.isDark ? '#1a1a2e' : '#ffffff',
              borderRadius: '12px',
              padding: '30px',
              width: '90%',
              maxWidth: '400px',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <XCircle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
            <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
              Error
            </h2>
            <p style={{ color: colors.textSecondary, fontSize: '14px', marginBottom: '20px' }}>
              {errorMessage}
            </p>
            <button
              onClick={() => setShowErrorModal(false)}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Delete Template Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setTemplateToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Email Template"
        message="Are you sure you want to delete this template? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="warning"
        isLoading={false}
      />
    </div>
  );
};

export default EmailTemplates;

