class AIService:
    @staticmethod
    def get_attendance_prediction():
        """Simulated AI attendance rate prediction"""
        return 96  # 96% attendance rate
    
    @staticmethod
    def verify_documents(registrations):
        """Simulated AI document verification"""
        # Count registrations with complete documents
        complete_count = 0
        for reg in registrations:
            # Simulate checking for required documents
            if reg.get('executive_summary_path') or reg.get('pitch_deck_path'):
                complete_count += 1
            elif reg.get('registration_type') in ['exco', 'jury', 'official', 'committee']:
                # Non-participant registrations don't need these docs
                complete_count += 1
        
        return {
            'total': len(registrations),
            'complete': complete_count,
            'incomplete': len(registrations) - complete_count,
            'message': f"Verification complete: {complete_count} documents found"
        }
    
    @staticmethod
    def get_country_heatmap_data():
        """Get simulated country participation data for heatmap"""
        return [
            {'country': 'Indonesia', 'active': True, 'delegates': 45},
            {'country': 'Malaysia', 'active': True, 'delegates': 38},
            {'country': 'Singapore', 'active': True, 'delegates': 32},
            {'country': 'Thailand', 'active': True, 'delegates': 28},
            {'country': 'Vietnam', 'active': True, 'delegates': 25},
            {'country': 'Australia', 'active': True, 'delegates': 22},
            {'country': 'Japan', 'active': True, 'delegates': 20},
            {'country': 'Philippines', 'active': True, 'delegates': 18},
            {'country': 'India', 'active': True, 'delegates': 17},
            {'country': 'South Korea', 'active': True, 'delegates': 15},
            {'country': 'China', 'active': True, 'delegates': 14},
            {'country': 'Taiwan', 'active': True, 'delegates': 13},
            {'country': 'Hong Kong', 'active': True, 'delegates': 12},
            {'country': 'Pakistan', 'active': True, 'delegates': 10},
            {'country': 'Bangladesh', 'active': True, 'delegates': 9},
            {'country': 'Sri Lanka', 'active': True, 'delegates': 8},
            {'country': 'Nepal', 'active': False, 'delegates': 5},
            {'country': 'Cambodia', 'active': False, 'delegates': 4},
            {'country': 'Laos', 'active': False, 'delegates': 3},
            {'country': 'Myanmar', 'active': False, 'delegates': 2},
            {'country': 'Brunei', 'active': False, 'delegates': 2},
        ]
