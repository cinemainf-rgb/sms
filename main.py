import os
from kivy.app import App
from kivy.lang import Builder
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.button import Button
from kivy.uix.label import Label
from kivy.uix.gridlayout import GridLayout

kv_code = """
<MainUI>:
    orientation: 'vertical'
    padding: 10
    spacing: 10

    Label:
        text: "FAZLAKA NET MANAGER"
        font_size: '22sp'
        bold: True
        color: 0.2, 0.6, 1, 1
        size_hint_y: 0.08

    Label:
        text: "Printer: Disconnected"
        font_size: '14sp'
        color: 1, 0.3, 0.3, 1
        size_hint_y: 0.04

    Button:
        text: "Connect Bluetooth Printer"
        background_color: 0.5, 0.2, 0.8, 1
        size_hint_y: 0.12
        bold: True

    GridLayout:
        cols: 2
        spacing: 10
        size_hint_y: 0.12
        Button:
            text: "User Manager"
            background_color: 0.1, 0.7, 0.4, 1
            bold: True
        Button:
            text: "Active Users"
            background_color: 0.1, 0.5, 0.8, 1
            bold: True

    Button:
        text: "Debts & Ledger"
        background_color: 0.9, 0.5, 0.1, 1
        size_hint_y: 0.10
        bold: True

    Button:
        text: "Network Expenses"
        background_color: 0.8, 0.1, 0.4, 1
        size_hint_y: 0.10
        bold: True

    Button:
        text: "Treasury & Profits Report"
        background_color: 0.1, 0.6, 0.4, 1
        size_hint_y: 0.10
        bold: True

    Label:
        text: "Select Voucher Category:"
        font_size: '14sp'
        color: 0.8, 0.8, 0.8, 1
        size_hint_y: 0.04

    Button:
        text: "20 ج.م Profile (2 GB)"
        background_color: 0.3, 0.3, 0.35, 1
        size_hint_y: 0.12
        bold: True

    Label:
        text: "Today's Total: 0.00 ج.م"
        font_size: '16sp'
        bold: True
        color: 0.2, 0.8, 1, 1
        size_hint_y: 0.04

    Button:
        text: "Generate & Print Voucher"
        background_color: 0.9, 0.5, 0.1, 1
        size_hint_y: 0.12
        bold: True

    Button:
        text: "Backup Data"
        background_color: 0.2, 0.25, 0.35, 1
        size_hint_y: 0.08
"""

Builder.load_string(kv_code)

class MainUI(BoxLayout):
    pass

class FazlakaApp(App):
    def build(self):
        return MainUI()

if __name__ == '__main__':
    FazlakaApp().run()
  
